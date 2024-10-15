# LogiCraft-Atlan

**LogiCraft** is a mobile application built using **React Native** for the frontend, **Go** for the backend, and **MongoDB** as the database. It serves as an on-demand logistics platform for goods transportation, connecting users who need to transport items with a fleet of drivers managed by a logistics company. The platform supports real-time booking, vehicle tracking, and fleet management. It is optimized to handle 10,000 concurrent requests per second and supports role-based access for **Users**, **Drivers**, and **Admins**.

## Important Links

- [Application Documentation](https://docs.google.com/document/d/19y_2Z2h8a4nK_kznD7BpTyaijFbSvPBnF-2k-PqFUpI/edit?usp=sharing)
- [Server Design and Performance Documentation](https://docs.google.com/document/d/1XsRCAhwCMktE8sa5x5Ug_TZKpJUFlj9lO4Z_fmu4F5U/edit?usp=sharing)
- [Database Design Document](https://docs.google.com/document/d/1GbG00t6es6XD8rnQmQBWQ5MXRXZyd3XpYeCh5JLNLN0/edit?usp=sharing)
- [ER Digram](https://docs.google.com/document/d/1DhPehCcUAxzLiIHvb9vHMCsbhPjaDTO3CJoSNH9s8OU/edit?usp=sharing)
- [Application Demo Video](https://drive.google.com/file/d/1spds-vsX7Ds7xGDg384MLyLvPwamXRqu/view?usp=sharing)
  
## Repository Structure

The repository is organized into two main directories:

1. **LogiCraft-Frontend**: This contains the **React Native** mobile application.

   - To install dependencies, run:
     ```bash
     npm install
     ```
   - To start the app, run:
     ```bash
     npm start
     ```

2. **LogiCraft-Backend**: This contains the backend implementation in **Go**, divided into two folders:
   
   - **loadbalancer**: Implements the load balancer for distributing requests across multiple instances.
   - **logiCraft-Server**: Contains the core server code for handling API requests.

## Setup Instructions

### Backend Setup

1. **Start the Load Balancer:**
   Navigate to the `LogiCraft-Backend/loadbalancer` directory and run:
   ```bash
   go run loadbalancer.go
   ```
   This will start the load balancer on port `8080`.

2. **Start the Server Instances:**
   Navigate to the `LogiCraft-Backend/logiCraft-Server` directory and run:
   ```bash
   sh start_servers.sh
   ```
   This script will start multiple instances of the server, managed by the load balancer.

### Frontend Setup

1. **Install Dependencies:**
   Navigate to the `LogiCraft-Frontend` directory and run:
   ```bash
   npm install
   ```

2. **Run the Mobile Application:**
   Start the app by running:
   ```bash
   npm start
   ```
   This will open the **Expo** development environment, where you can run the app on an emulator or a physical device.

---

By following these steps, you can successfully set up and run the **LogiCraft** logistics platform for goods transportation management.
