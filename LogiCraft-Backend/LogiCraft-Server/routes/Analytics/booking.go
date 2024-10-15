package analytics

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"logi-craft/db"

	"go.mongodb.org/mongo-driver/bson"
)

type BookingStatus struct {
	TotalBookings int `json:"total_bookings"`
	Completed     int `json:"completed"`
	Pending       int `json:"pending"`
}

func GetBookingAnalysis(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Booking analaytics requested")

	collection := db.GetCollection("bookings")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// get total bookings
	totalCount, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch bookings", http.StatusInternalServerError)
		return
	}

	// get completed bookings
	completedCount, err := collection.CountDocuments(ctx, bson.M{"job_status": "completed"})
	if err != nil {
		http.Error(w, "Failed to fetch completed bookings", http.StatusInternalServerError)
		return
	}

	// fmt.Println(completedCount)

	// Calculate pending bookings
	pendingCount := totalCount - completedCount

	json.NewEncoder(w).Encode(BookingStatus{
		TotalBookings: int(totalCount),
		Completed:     int(completedCount),
		Pending:       int(pendingCount),
	})
}
