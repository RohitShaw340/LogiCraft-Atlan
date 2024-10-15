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

type Booking struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	VehicleNo       string             `bson:"vehicle_no" json:"vehicle_no"`
	DriverID        primitive.ObjectID `bson:"driver_id" json:"driver_id"`
	PickupLocation  Coordinates        `bson:"pickup_location" json:"pickup_location"`
	DropoffLocation Coordinates        `bson:"dropoff_location" json:"dropoff_location"`
	Distance        float64            `bson:"distance" json:"distance"`
	Cost            float64            `bson:"cost" json:"cost"`
	JobStatus       string             `bson:"job_status" json:"job_status"`
}

type Assignment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UID       primitive.ObjectID `bson:"uid" json:"uid"`
	VehicleNo string             `bson:"vehicle_no" json:"vehicle_no"`
	BookingID string             `bson:"booking_id" json:"booking_id"`
}
