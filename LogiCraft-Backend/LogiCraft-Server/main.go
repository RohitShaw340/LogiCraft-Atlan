package main

import (
	"fmt"
	"logi-craft/db"
	"logi-craft/routes"
	analytics "logi-craft/routes/Analytics"
	authentication "logi-craft/routes/Authentication"
	booking "logi-craft/routes/Booking"
	user "logi-craft/routes/User"
	vehicles "logi-craft/routes/Vehicles"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	db.ConnectDB("mongodb://localhost:27017")

	router := mux.NewRouter()
	router.HandleFunc("/", routes.GetHome)

	// Authentication
	router.HandleFunc("/login", authentication.LoginHandler).Methods("POST")
	router.HandleFunc("/signup", authentication.SignupHandler).Methods("POST")

	// Bookings
	router.HandleFunc("/book", booking.HandleBooking).Methods("POST")
	router.HandleFunc("/booking/{bookingId}", booking.GetBookingByID).Methods("GET")
	router.HandleFunc("/bookings/id/user/{uid}", booking.GetBookingsByUID).Methods("GET")
	router.HandleFunc("/bookings/id/driver/{driverId}", booking.GetBookingsByDriverID).Methods("GET")
	router.HandleFunc("/bookings", booking.GetAllBookings).Methods("GET")
	router.HandleFunc("/complete-job/{bookingId}", booking.CompleteJobHandler).Methods("Get")

	// Analytics
	router.HandleFunc("/analysis/bookings", analytics.GetBookingAnalysis).Methods("GET")
	router.HandleFunc("/analysis/vehicles", analytics.GetVehicleAnalysis).Methods("GET")
	router.HandleFunc("/analysis/drivers", analytics.GetDriverAnalysis).Methods("GET")

	// Users
	router.HandleFunc("/users/{uid}", user.GetUserInfoById).Methods("GET")

	// Assignments
	router.HandleFunc("/assignment-user/{uid}", booking.GetAssignmentByUid).Methods("GET")
	router.HandleFunc("/assignment-vehicle/{vehicle_no}", booking.GetAssignmentByVehicleNo).Methods("GET")
	router.HandleFunc("/assignments", booking.GetAllAssignments).Methods("GET")
	router.HandleFunc("/assignments/{uid}/assign_vehicle", booking.AssignVehicle).Methods("PUT")

	// Vehicles
	router.HandleFunc("/vehicle/{vehicleNo}", vehicles.GetVehicleInfoById).Methods("GET")
	router.HandleFunc("/vehicles", vehicles.GetAllVehicles).Methods("GET")
	router.HandleFunc("/add/vehicle", vehicles.AddVehicleHandler).Methods("POST")
	router.HandleFunc("/vehicle/update-location/{vehicle_no}", vehicles.UpdateVehicleLocation).Methods("PUT")
	router.HandleFunc("/vehicle-coords/{vehicle_no}", vehicles.GetVehicleCoordsHandler).Methods("GET")

	port := "4001"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	fmt.Printf("Starting server on port %s\n", port)
	err := http.ListenAndServe(":"+port, router)

	if err != nil {
		panic(fmt.Sprintf("Unable to start server on port %s", port))
	}
}
