package authentication

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"logi-craft/db"
	"logi-craft/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SignupRequest struct {
	Name        string `json:"name"`
	Address     string `json:"address"`
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
	UserType    string `json:"user_type"`
}

type SignupResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {

	// fmt.Println("Signup Requested")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var signupReq SignupRequest
	err := json.NewDecoder(r.Body).Decode(&signupReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Prepare the user data
	newUser := models.User{
		Name:        signupReq.Name,
		Address:     signupReq.Address,
		PhoneNumber: signupReq.PhoneNumber,
		Password:    signupReq.Password,
		UserType:    signupReq.UserType,
	}

	// Connect to the MongoDB collection
	collection := db.GetCollection("users")

	// Check if the phone number already exists
	filter := bson.M{"phone_number": signupReq.PhoneNumber}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Err()
	if err == nil {
		// Phone number already exists
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Phone number already registered"})
		return
	}

	// Insert the new user
	insertResult, err := collection.InsertOne(ctx, newUser)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Get the inserted user's ID
	userID := insertResult.InsertedID.(primitive.ObjectID)

	// If the user type is "driver", create an entry in the assignments collection
	if signupReq.UserType == "driver" {
		assignmentsCollection := db.GetCollection("assignments")

		// Prepare the assignment data
		newAssignment := models.Assignment{
			UID:       userID,
			VehicleNo: "",
			BookingID: "",
		}

		// Insert the new assignment
		_, err := assignmentsCollection.InsertOne(ctx, newAssignment)
		if err != nil {
			http.Error(w, "Failed to create driver assignment", http.StatusInternalServerError)
			return
		}
	}

	// Respond with success
	json.NewEncoder(w).Encode(SignupResponse{Success: true, Message: "User created successfully"})
}
