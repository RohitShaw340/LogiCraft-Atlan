package booking

import (
	"context"
	"encoding/json"
	"math"
	"net/http"
	"time"

	"logi-craft/db"
	"logi-craft/models"
	"logi-craft/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingRequest struct {
	UserID        string             `json:"user_id"`
	VehicleType   string             `json:"vehicle_type"`
	PickupCoords  models.Coordinates `json:"pickup_coords"`
	DropoffCoords models.Coordinates `json:"dropoff_coords"`
	Distance      float64            `json:"distance"`
	Cost          float64            `json:"estimatedCost"`
}

var vehiclesCollection *mongo.Collection
var bookingsCollection *mongo.Collection

// Setup MongoDB collections
func InitDB(client *mongo.Client) {
	vehiclesCollection = db.GetCollection("vehicles")
	bookingsCollection = db.GetCollection("bookings")
}

// Handle booking request
func HandleBooking(w http.ResponseWriter, r *http.Request) {
	var req BookingRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Parse user_id from string to ObjectID
	userID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	filter := bson.M{
		"vehicle_type": req.VehicleType,
		"busy":         false,
	}

	var availableVehicles []models.Vehicle
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	vehiclesCollection = db.GetCollection("vehicles")

	// Fetch available vehicles
	cursor, err := vehiclesCollection.Find(ctx, filter)
	if err != nil {
		http.Error(w, "Error fetching vehicles", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &availableVehicles); err != nil {
		http.Error(w, "Error decoding vehicles", http.StatusInternalServerError)
		return
	}

	if len(availableVehicles) == 0 {

		http.Error(w, "No available vehicles found", http.StatusNotFound)
		return
	}

	// Calculate distance and find the closest vehicle
	var closestVehicle models.Vehicle
	var shortestDistance float64 = math.Inf(1)

	for _, vehicle := range availableVehicles {
		distance := utils.HaversineDistance(
			req.PickupCoords.Latitude, req.PickupCoords.Longitude,
			vehicle.Coordinates.Latitude, vehicle.Coordinates.Longitude,
		)
		if distance < shortestDistance {
			shortestDistance = distance
			closestVehicle = vehicle
		}
	}

	// Get the DriverID from the Assignments collection
	var assignment models.Assignment
	assignmentFilter := bson.M{"vehicle_no": closestVehicle.VehicleNo}
	err = db.GetCollection("assignments").FindOne(ctx, assignmentFilter).Decode(&assignment)
	if err != nil {
		http.Error(w, "Error finding assignment for vehicle", http.StatusInternalServerError)
		return
	}

	newBooking := models.Booking{
		UserID:          userID,
		VehicleNo:       closestVehicle.VehicleNo,
		DriverID:        assignment.UID,
		PickupLocation:  req.PickupCoords,
		DropoffLocation: req.DropoffCoords,
		Distance:        req.Distance,
		Cost:            req.Cost,
		JobStatus:       "in-transit",
	}

	bookingsCollection = db.GetCollection("bookings")

	// Insert the new booking and capture the result
	insertResult, err := bookingsCollection.InsertOne(ctx, newBooking)
	if err != nil {
		http.Error(w, "Error creating booking", http.StatusInternalServerError)
		return
	}

	bookingID := insertResult.InsertedID.(primitive.ObjectID)

	// Update the assignment collection with the new booking ID
	assignmentUpdate := bson.M{
		"$set": bson.M{
			"booking_id": bookingID.Hex(), // Convert ObjectID to string and set it in assignment
		},
	}

	_, err = db.GetCollection("assignments").UpdateOne(ctx, bson.M{"uid": assignment.UID}, assignmentUpdate)
	if err != nil {
		http.Error(w, "Error updating assignment with booking ID", http.StatusInternalServerError)
		return
	}

	// Mark the vehicle as busy
	update := bson.M{"$set": bson.M{"busy": true}}
	_, err = vehiclesCollection.UpdateOne(ctx, bson.M{"_id": closestVehicle.ID}, update)
	if err != nil {
		http.Error(w, "Error updating vehicle status", http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"booking": newBooking,
	})
}
