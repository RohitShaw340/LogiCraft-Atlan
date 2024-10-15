package analytics

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"logi-craft/db"

	"go.mongodb.org/mongo-driver/bson"
)

type VehicleStatus struct {
	TotalVehicles int `json:"total_vehicles"`
	Free          int `json:"free"`
	Busy          int `json:"busy"`
}

func GetVehicleAnalysis(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Vehicle analaytics requested")

	collection := db.GetCollection("vehicles")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get total vehicles
	totalCount, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch vehicles", http.StatusInternalServerError)
		return
	}

	// Get free vehicles (busy: false)
	freeCount, err := collection.CountDocuments(ctx, bson.M{"busy": false})
	if err != nil {
		http.Error(w, "Failed to fetch free vehicles", http.StatusInternalServerError)
		return
	}

	// Calculate busy vehicles
	busyCount := totalCount - freeCount

	json.NewEncoder(w).Encode(VehicleStatus{
		TotalVehicles: int(totalCount),
		Free:          int(freeCount),
		Busy:          int(busyCount),
	})
}
