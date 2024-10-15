package vehicles

import (
	"context"
	"encoding/json"
	"logi-craft/db"
	"logi-craft/models"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type VehicleRequest struct {
	VehicleNo   string `bson:"vehicle_no"`
	VehicleType string `bson:"vehicle_type"`
}

type VehicleResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Vehicle models.Vehicle `json:"vehicle,omitempty"`
}

// GetVehicleInfo retrieves vehicle information by vehicle number
func GetVehicleInfoById(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Vehicle info requested")
	params := mux.Vars(r)
	vehicleNo := params["vehicleNo"]
	if vehicleNo == "" {
		http.Error(w, "Missing Vehicle Number parameter", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("vehicles")
	filter := bson.M{"vehicle_no": vehicleNo}
	var vehicle models.Vehicle

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, filter).Decode(&vehicle)
	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(VehicleResponse{Success: false, Message: "Vehicle not found"})
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch vehicle", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(VehicleResponse{
		Success: true,
		Message: "Vehicle retrieved successfully",
		Vehicle: vehicle,
	})
}

type VehiclesResponse struct {
	Success  bool             `json:"success"`
	Message  string           `json:"message"`
	Vehicles []models.Vehicle `json:"vehicles,omitempty"`
}

// GetAllVehicles retrieves all vehicles from the database
func GetAllVehicles(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Fetching all vehicles")

	// Get the vehicles collection
	collection := db.GetCollection("vehicles")
	var vehicles []models.Vehicle

	// Define context with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Create a cursor to find all vehicles
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch vehicles", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Iterate through the cursor and decode each vehicle
	for cursor.Next(ctx) {
		var vehicle models.Vehicle
		if err := cursor.Decode(&vehicle); err != nil {
			http.Error(w, "Failed to decode vehicle", http.StatusInternalServerError)
			return
		}
		vehicles = append(vehicles, vehicle)
	}

	// Check for any error that occurred during iteration
	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error while fetching vehicles", http.StatusInternalServerError)
		return
	}

	// Return the list of vehicles
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(VehiclesResponse{
		Success:  true,
		Message:  "Vehicles retrieved successfully",
		Vehicles: vehicles,
	})
}

// Handler function to add a new vehicle
func AddVehicleHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Add vehicle requested")
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var vehicle models.Vehicle
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&vehicle)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}
	// Define context with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingVehicle models.Vehicle
	err = db.GetCollection("vehicles").FindOne(ctx, bson.M{"vehicle_no": vehicle.VehicleNo}).Decode(&existingVehicle)
	if err == nil {
		// Vehicle already exists
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Vehicle already exists"})
		return
	}

	// fmt.Println(vehicle)

	// Set default values
	vehicle.Coordinates = models.Coordinates{Latitude: 28.612894, Longitude: 77.216721} // Default coordinates
	vehicle.Busy = false                                                                // Default busy status

	collection := db.GetCollection("vehicles")

	// Insert vehicle into the database
	_, err = collection.InsertOne(context.TODO(), vehicle)
	if err != nil {
		http.Error(w, "Failed to add vehicle", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(vehicle)
}

// Struct for the request payload to update location
type LocationUpdate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	UID       string  `json:"uid"`
}

// UpdateVehicleLocation updates the location of a vehicle by its vehicle number
func UpdateVehicleLocation(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Update vehicle location requested")
	// Extract vehicle_no from the URL
	vars := mux.Vars(r)
	vehicleNo := vars["vehicle_no"]

	// Decode the request body
	var locationUpdate LocationUpdate
	err := json.NewDecoder(r.Body).Decode(&locationUpdate)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Set up context and MongoDB connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get vehicles collection
	vehiclesCollection := db.GetCollection("vehicles")

	// Find the vehicle by vehicle_no and update its coordinates
	filter := bson.M{"vehicle_no": vehicleNo}
	update := bson.M{
		"$set": bson.M{
			"coordinates": models.Coordinates{
				Latitude:  locationUpdate.Latitude,
				Longitude: locationUpdate.Longitude,
			},
		},
	}

	// Perform the update
	result, err := vehiclesCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		http.Error(w, "Failed to update vehicle location", http.StatusInternalServerError)
		return
	}

	// Check if the vehicle was found and updated
	if result.MatchedCount == 0 {
		http.Error(w, "Vehicle not found", http.StatusNotFound)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Vehicle location updated successfully",
	})
}

func GetVehicleCoordsHandler(w http.ResponseWriter, r *http.Request) {
	// Get vehicle_no from the URL parameters
	vars := mux.Vars(r)
	vehicleNo := vars["vehicle_no"]

	// Get the MongoDB collection
	collection := db.GetCollection("vehicles")

	// Find the vehicle by its vehicle number
	filter := bson.M{"vehicle_no": vehicleNo}
	var vehicle models.Vehicle
	err := collection.FindOne(context.Background(), filter).Decode(&vehicle)
	if err != nil {
		http.Error(w, "Vehicle not found", http.StatusNotFound)
		return
	}

	// Return the vehicle coordinates as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vehicle.Coordinates)
}
