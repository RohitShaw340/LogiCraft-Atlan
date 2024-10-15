package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Assignment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UID       primitive.ObjectID `bson:"uid" json:"uid"`
	VehicleNo string             `bson:"vehicle_no" json:"vehicle_no"`
	BookingID string             `bson:"booking_id" json:"booking_id"`
}
