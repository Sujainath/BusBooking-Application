# On Time Travels – Bus Booking System

A full-stack bus booking web application built with **Java 21, Spring Boot, MySQL, HTML, CSS, and JavaScript**. The application allows passengers to register, log in, search for bus schedules, select seats, book tickets, and manage their bookings. An admin login provides access to administrative features.

## 🌐 Live Demo

- **Frontend:** https://on-time-bus-booking.onrender.com
- **Backend API:** https://on-time-travels.onrender.com
- **GitHub Repository:** https://github.com/Sujainath/BusBooking-Application.git

> Note: The free hosting service may take a little time to start after a period of inactivity.

## ✨ Features

### Passenger Features
- User registration and login
- Search bus schedules by source, destination, and travel date
- View available and booked seats
- Select seats and enter passenger details
- Complete the simulated payment process
- View booking details and booking history
- Download tickets
- Cancel eligible bookings according to the cancellation policy

### Admin Features
- Separate admin login using an admin name and secret key
- Access to administrative features through the admin dashboard
- Role-based access control for protected admin endpoints

### Booking Rules
- Travel dates are restricted to today or future dates.
- A maximum of six seats can be booked per booking.
- Cancellation is permitted until eight hours before departure.
- A 10% cancellation deduction applies according to the project rules.
- Fares vary by seat type and travel day.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Frontend | HTML5, CSS3, JavaScript |
| Build Tool | Apache Maven |
| Deployment | Render |
| Database Hosting | Aiven MySQL |

## 🏗️ Architecture

The application follows a frontend-backend architecture:

1. The frontend provides the user interface and sends HTTP requests to the backend.
2. The Spring Boot REST API processes authentication, booking, and application logic.
3. Spring Data JPA and Hibernate communicate with the MySQL database.
4. JWT-based authentication supports access to protected endpoints.

## ⚙️ Run Locally

### Prerequisites

- Java Development Kit (JDK) 21
- Apache Maven
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sujainath/BusBooking-Application.git
cd BusBooking-Application
```

### 2. Configure Environment Variables

Configure the following environment variables for the backend:

| Variable | Description |
|---|---|
| `DB_URL` | MySQL JDBC connection URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `ADMIN_KEY` | Secret key used for admin login |
| `PORT` | Server port; optional for local development |

Example JDBC URL:

```text
jdbc:mysql://localhost:3306/bus_booking
```

Create the database in MySQL and configure the connection details for your local environment.

**Security:** Never commit database passwords, admin keys, JWT secrets, or other credentials to GitHub.

### 3. Start the Backend

From the backend project directory, run:

```bash
mvn spring-boot:run
```

The application uses the configured server port. If no `PORT` variable is supplied, the default port is determined by the application configuration.

### 4. Start the Frontend

Open the frontend using a local static web server, such as the Live Server extension in Visual Studio Code. Configure the frontend API base URL to point to your locally running backend.

For deployment, the frontend must point to the deployed backend API URL.

## 🔐 Authentication and Security

- Passenger authentication uses email and password.
- Passwords are handled using Spring Security's password encoder.
- JWT tokens are used for authenticated requests.
- Admin access is separated from passenger access.
- The admin secret is configured through an environment variable rather than being stored in source code.

## 🚀 Deployment

The project is deployed using Render for the frontend and backend, with Aiven MySQL as the hosted database.

To deploy your own instance:

1. Create a MySQL database.
2. Configure the backend environment variables.
3. Deploy the Spring Boot application.
4. Configure the frontend API URL to match the deployed backend.
5. Configure CORS to allow requests from your frontend domain.
6. Test registration, login, booking, and admin access after deployment.

## 📚 What I Learned

- Building REST APIs using Spring Boot
- Connecting a Java application to MySQL
- Using Spring Data JPA and Hibernate
- Implementing authentication and authorization
- Integrating a JavaScript frontend with a REST backend
- Configuring environment variables and deploying a web application
- Debugging deployment, API, and CORS issues

## 👨‍💻 Author

**Sujainath**

GitHub: https://github.com/Sujainath

---

*On Time Travels is a portfolio project created to demonstrate full-stack application development, backend API design, database integration, authentication, and deployment.*
