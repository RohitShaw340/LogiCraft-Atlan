package booking

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"logi-craft/db"
	"logi-craft/models"
	"logi-craft/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Booking models.Booking `json:"booking,omitempty"`
}

type BookingsResponse struct {
	Success  bool             `json:"success"`
	Message  string           `json:"message"`
	Bookings []models.Booking `json:"bookings,omitempty"`
}

func GetAllBookings(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("bookings")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get all Bookings from Bookings collection
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var bookings []bson.M
	if err := cursor.All(ctx, &bookings); err != nil {
		http.Error(w, "Failed to parse bookings", http.StatusInternalServerError)
		return
	}

	// Send all booking data
	json.NewEncoder(w).Encode(bookings)
}

// GetBookingDetails retrieves booking details by booking ID
func GetBookingByID(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Booking details requested")
	params := mux.Vars(r)
	bookingId := params["bookingId"]
	if bookingId == "" {
		http.Error(w, "Missing Booking ID parameter", http.StatusBadRequest)
		return
	}
	id, err := primitive.ObjectIDFromHex(bookingId)
	collection := db.GetCollection("bookings")
	filter := bson.M{"_id": id}
	var booking models.Booking

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Decode(&booking)
	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(BookingResponse{Success: false, Message: "Booking not found"})
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch booking", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BookingResponse{
		Success: true,
		Message: "Booking retrieved successfully",
		Booking: booking,
	})
}

// GetBookingsByUID retrieves bookings by user UID
func GetBookingsByUID(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Bookings for user requested")
	params := mux.Vars(r)
	uid := params["uid"]
	if uid == "" {
		http.Error(w, "Missing UID parameter", http.StatusBadRequest)
		return
	}
	id, err := primitive.ObjectIDFromHex(uid)
	collection := db.GetCollection("bookings")
	filter := bson.M{"user_id": id}
	var bookings []models.Booking

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find all bookings that match the uid
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		http.Error(w, "Failed to fetch bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Decode the bookings into the slice
	if err = cursor.All(ctx, &bookings); err != nil {
		http.Error(w, "Error decoding bookings", http.StatusInternalServerError)
		return
	}

	if len(bookings) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(BookingsResponse{Success: false, Message: "No bookings found for this user"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BookingsResponse{
		Success:  true,
		Message:  "Bookings retrieved successfully",
		Bookings: bookings,
	})
}

// GetBookingsByDriverID retrieves bookings by user DriverID
func GetBookingsByDriverID(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Bookings for user requested")
	params := mux.Vars(r)
	driver_id := params["driverId"]
	if driver_id == "" {
		http.Error(w, "Missing DriverId parameter", http.StatusBadRequest)
		return
	}

	id, err := primitive.ObjectIDFromHex(driver_id)
	collection := db.GetCollection("bookings")
	filter := bson.M{"driver_id": id}
	var bookings []models.Booking

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find all bookings that match the uid
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		http.Error(w, "Failed to fetch bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Decode the bookings into the slice
	if err = cursor.All(ctx, &bookings); err != nil {
		http.Error(w, "Error decoding bookings", http.StatusInternalServerError)
		return
	}

	if len(bookings) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(BookingsResponse{Success: false, Message: "No bookings found for this user"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BookingsResponse{
		Success:  true,
		Message:  "Bookings retrieved successfully",
		Bookings: bookings,
	})
}

func CompleteJobHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Completing job")

	bookingCollection := db.GetCollection("bookings")
	vehicleCollection := db.GetCollection("vehicles")
	assignmentCollection := db.GetCollection("assignments")

	vars := mux.Vars(r)
	bookingID := vars["bookingId"]

	id, err := primitive.ObjectIDFromHex(bookingID)
	// fmt.Println(bookingID)

	// Fetch booking details using booking ID
	var booking models.Booking
	err = bookingCollection.FindOne(r.Context(), bson.M{"_id": id}).Decode(&booking)
	if err != nil {
		fmt.Println(err)
		http.Error(w, `{"message": "Booking not found"}`, http.StatusNotFound)
		return
	}
	// fmt.Println(booking)

	// Fetch vehicle details using vehicle number
	var vehicle models.Vehicle
	err = vehicleCollection.FindOne(r.Context(), bson.M{"vehicle_no": booking.VehicleNo}).Decode(&vehicle)
	if err != nil {
		http.Error(w, `{"message": "Vehicle not found"}`, http.StatusNotFound)
		return
	}

	// Calculate distance using the HaversineDistance function
	distance := utils.HaversineDistance(vehicle.Coordinates.Latitude, vehicle.Coordinates.Longitude, booking.DropoffLocation.Latitude, booking.DropoffLocation.Longitude)

	if distance <= 5.0 {
		// Update job status to completed
		_, err = bookingCollection.UpdateOne(r.Context(), bson.M{"_id": booking.ID}, bson.M{
			"$set": bson.M{"job_status": "completed"},
		})
		if err != nil {
			http.Error(w, `{"message": "Failed to update job status"}`, http.StatusInternalServerError)
			return
		}

		// Mark vehicle as not busy
		_, err = vehicleCollection.UpdateOne(r.Context(), bson.M{"_id": vehicle.ID}, bson.M{
			"$set": bson.M{"busy": false},
		})
		if err != nil {
			http.Error(w, `{"message": "Failed to complete job"}`, http.StatusInternalServerError)
			return
		}

		// Clear booking ID in assignment collection
		_, err = assignmentCollection.UpdateOne(r.Context(), bson.M{"vehicle_no": booking.VehicleNo}, bson.M{
			"$set": bson.M{"booking_id": ""},
		})
		if err != nil {
			http.Error(w, "Failed to update assignment", http.StatusInternalServerError)
			return
		}

		// Respond with success message
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode("Job marked as completed")
	} else {
		// Send message that vehicle is out of range
		http.Error(w, `{"message": "You are not in range of the delivery location"}`, http.StatusBadRequest)

	}
}
