package authentication

import (
	"context"
	"encoding/json"
	"logi-craft/db"
	"logi-craft/models"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type LoginRequest struct {
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
}

type LoginResponse struct {
	UID         string `json:"uid"`
	Name        string `json:"name"`
	Address     string `json:"address"`
	PhoneNumber string `json:"phone_number"`
	UserType    string `json:"type"`
	Success     bool   `json:"success"`
	Message     string `json:"message"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var loginReq LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Connect to the MongoDB collection
	collection := db.GetCollection("users")

	// Search for the user in MongoDB
	var user models.User
	filter := bson.M{"phone_number": loginReq.PhoneNumber, "password": loginReq.Password}

	// fmt.Println("Login Requested")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid phone number or password", http.StatusUnauthorized)
		return
	}

	// User authenticated successfully
	loginRes := LoginResponse{
		UID:         user.UID,
		Name:        user.Name,
		Address:     user.Address,
		PhoneNumber: user.PhoneNumber,
		UserType:    user.UserType,
		Success:     true,
		Message:     "Authentication successful",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loginRes)
}
