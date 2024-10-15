package user

import (
	"context"
	"encoding/json"
	"logi-craft/db"
	"logi-craft/models"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	User    models.User `json:"user,omitempty"`
}

// GetUserInfoById retrieves user information by UID
func GetUserInfoById(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("User info requested")
	params := mux.Vars(r)
	uid := params["uid"]
	if uid == "" {
		http.Error(w, "Missing UID parameter", http.StatusBadRequest)
		return
	}
	// fmt.Println(uid)

	collection := db.GetCollection("users")

	// Check if UID is stored as ObjectID or string
	var filter bson.M
	id, err := primitive.ObjectIDFromHex(uid)
	if err != nil {
		// If the UID is not an ObjectID, query by string UID
		filter = bson.M{"_id": uid}
	} else {
		// If the UID is an ObjectID, query by ObjectID
		filter = bson.M{"_id": id}
	}

	var user models.User

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Decode(&user)
	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(UserResponse{Success: false, Message: "User not found"})
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(UserResponse{
		Success: true,
		Message: "User retrieved successfully",
		User:    user,
	})
}
