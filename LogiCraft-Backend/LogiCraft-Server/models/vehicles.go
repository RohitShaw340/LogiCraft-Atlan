package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Vehicle struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	VehicleNo   string             `bson:"vehicle_no" json:"vehicle_no"`
	VehicleType string             `bson:"vehicle_type" json:"vehicle_type"`
	Coordinates Coordinates        `bson:"coordinates" json:"coordinates,omitempty"`
	Busy        bool               `bson:"busy" json:"busy"`
}

type Coordinates struct {
	Latitude  float64 `bson:"latitude" json:"latitude"`
	Longitude float64 `bson:"longitude" json:"longitude"`
}
