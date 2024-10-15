package analytics

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"logi-craft/db"

	"go.mongodb.org/mongo-driver/bson"
)

type DriverStatus struct {
	TotalDrivers int `json:"total_drivers"`
	NotVerified  int `json:"not_verified"`
	Free         int `json:"free"`
	Busy         int `json:"busy"`
}

func GetDriverAnalysis(w http.ResponseWriter, r *http.Request) {
	// enableCORS(w)
	// fmt.Println("Driver analaytics requested")

	collection := db.GetCollection("assignments")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// get total drivers
	totalCount, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch assignments", http.StatusInternalServerError)
		return
	}

	// Get not verified drivers
	notVerifiedCount, err := collection.CountDocuments(ctx, bson.M{"vehicle_no": ""})
	if err != nil {
		http.Error(w, "Failed to fetch not verified drivers", http.StatusInternalServerError)
		return
	}

	// get free drivers (vehicle_no is not empty and booking_id is empty)
	freeCount, err := collection.CountDocuments(ctx, bson.M{"vehicle_no": bson.M{"$ne": ""}, "booking_id": ""})
	if err != nil {
		http.Error(w, "Failed to fetch free drivers", http.StatusInternalServerError)
		return
	}

	// Calculate busy drivers (total - not_verified - free)
	busyCount := totalCount - notVerifiedCount - freeCount

	json.NewEncoder(w).Encode(DriverStatus{
		TotalDrivers: int(totalCount),
		NotVerified:  int(notVerifiedCount),
		Free:         int(freeCount),
		Busy:         int(busyCount),
	})
}
