package models

type User struct {
	UID         string `json:"uid" bson:"_id,omitempty"`
	Name        string `json:"name" bson:"name"`
	Address     string `json:"address" bson:"address"`
	PhoneNumber string `json:"phone_number" bson:"phone_number"`
	Password    string `json:"-" bson:"password"`
	UserType    string `json:"user_type" bson:"user_type"`
}
