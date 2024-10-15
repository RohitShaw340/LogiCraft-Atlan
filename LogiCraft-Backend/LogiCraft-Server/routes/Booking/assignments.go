package booking

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"logi-craft/db"
	"logi-craft/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AssignmentResponse struct {
	Success    bool              `json:"success"`
	Message    string            `json:"message"`
	Assignment models.Assignment `json:"assignment,omitempty"`
}

// GetAssignments retrieves the assignment details of a driver based on their uid.
func GetAssignmentByUid(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("assignment requested")
	// Get the 'uid' from the URL params
	params := mux.Vars(r)
	uid := params["uid"]
	if uid == "" {
		http.Error(w, "Missing UID parameter", http.StatusBadRequest)
		return
	}

	// Connect to the MongoDB collection
	collection := db.GetCollection("assignments")

	uidObjID, err := primitive.ObjectIDFromHex(uid)
	// Query for the assignment based on the UID
	filter := bson.M{"uid": uidObjID}
	var assignment models.Assignment

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Decode(&assignment)
	if err == mongo.ErrNoDocuments {
		// Assignment not found for the given uid
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(AssignmentResponse{Success: false, Message: "Assignment not found"})
		return
	} else if err != nil {
		// Handle other errors
		http.Error(w, "Failed to fetch assignment", http.StatusInternalServerError)
		return
	}
	fmt.Println(assignment)

	// Return the assignment details
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AssignmentResponse{
		Success:    true,
		Message:    "Assignment retrieved successfully",
		Assignment: assignment,
	})
}

// GetAssignments retrieves the assignment details of a driver based on their uid.
func GetAssignmentByVehicleNo(w http.ResponseWriter, r *http.Request) {
	fmt.Println("assignment requested")
	// Get the 'uid' from the URL params
	params := mux.Vars(r)
	vehicle_no := params["vehicle_no"]
	if vehicle_no == "" {
		http.Error(w, "Missing UID parameter", http.StatusBadRequest)
		return
	}

	// Connect to the MongoDB collection
	collection := db.GetCollection("assignments")

	filter := bson.M{"vehicle_no": vehicle_no}
	var assignment models.Assignment

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, filter).Decode(&assignment)
	if err == mongo.ErrNoDocuments {
		// Assignment not found for the given uid
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(AssignmentResponse{Success: false, Message: "Assignment not found"})
		return
	} else if err != nil {
		// Handle other errors
		http.Error(w, "Failed to fetch assignment", http.StatusInternalServerError)
		return
	}
	fmt.Println(assignment)

	// Return the assignment details
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AssignmentResponse{
		Success:    true,
		Message:    "Assignment retrieved successfully",
		Assignment: assignment,
	})
}

// GetAllAssignments retrieves all assignments.
func GetAllAssignments(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("All assignments requested")

	collection := db.GetCollection("assignments")

	var assignments []models.Assignment

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch assignments", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var assignment models.Assignment
		if err := cursor.Decode(&assignment); err != nil {
			http.Error(w, "Failed to decode assignment", http.StatusInternalServerError)
			return
		}
		assignments = append(assignments, assignment)
		// fmt.Println(assignment.ID)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Failed to iterate through assignments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignments)
}

func AssignVehicle(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Assigning vehicle to driver")
	params := mux.Vars(r)
	uid := params["uid"]
	if uid == "" {
		http.Error(w, "Missing UID parameter", http.StatusBadRequest)
		return
	}

	var assignmentUpdate struct {
		VehicleNo string `json:"vehicle_no"`
	}

	if err := json.NewDecoder(r.Body).Decode(&assignmentUpdate); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// fmt.Println(assignmentUpdate, uid)

	// Connect to the vehicle collection to verify the vehicle details
	vehicleCollection := db.GetCollection("vehicles")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var vehicle models.Vehicle
	vehicleFilter := bson.M{"vehicle_no": assignmentUpdate.VehicleNo}

	// Check if the vehicle exists and is not busy
	err := vehicleCollection.FindOne(ctx, vehicleFilter).Decode(&vehicle)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "Vehicle not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to check vehicle status", http.StatusInternalServerError)
		return
	}

	if vehicle.Busy {
		http.Error(w, "Vehicle is currently busy", http.StatusConflict)
		return
	}
	// fmt.Println(vehicle)

	// Proceed to assign the vehicle to the driver
	assignmentCollection := db.GetCollection("assignments")

	uidObjID, err := primitive.ObjectIDFromHex(uid)
	if err != nil {
		http.Error(w, "Invalid UID format", http.StatusBadRequest)
		return
	}

	// Update the assignment in the assignments collection
	result, err := assignmentCollection.UpdateOne(ctx,
		bson.M{"uid": uidObjID},
		bson.M{"$set": bson.M{"vehicle_no": assignmentUpdate.VehicleNo}})
	if err != nil {
		fmt.Printf("Error updating assignment: %v\n", err)
		http.Error(w, "Failed to update assignment", http.StatusInternalServerError)
		return
	}

	if result.ModifiedCount == 0 {
		http.Error(w, "No documents were updated", http.StatusConflict)
		return
	}

	// fmt.Println("success")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Vehicle assigned successfully"}`))
}
