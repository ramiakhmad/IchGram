# Insta Clone App

**Insta Clone** is a social media application that replicates core functionalities of Instagram, allowing users to share posts, explore content, send messages, and manage profiles. The application is built with a React frontend and a Node.js backend, utilizing MongoDB for database management. It also features Docker-based deployment and is designed to work seamlessly across mobile and desktop devices.

## Features

- **Authentication**: Secure user login and registration with JWT-based authentication via HTTP-only cookies.
- **Post Management**: Create, edit, and delete posts with support for image uploads via Cloudinary.
- **Explore Feed**: View and interact with posts from other users.
- **Messaging**: Real-time messaging between users.
- **Notifications**: Receive updates about new followers, likes, and comments.
- **Responsive Design**: Optimized for both mobile and desktop viewing experiences.

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Cloudinary
- **Authentication**: JSON Web Tokens (JWT) via Cookies
- **Deployment**: Docker, Render.com
- **Version Control**: Git, GitHub

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/anautomnee/insta_clone.git
   cd insta_clone
   
2. **Set Up Environment Variables**:

Create a .env file in both the client and server directories with the necessary environment variables. Refer to .env.example files if available.

Install Dependencies:

For the backend:

```bash
    cd server
    npm install
```

For the frontend:

```bash
cd client
npm install
```

## Running the Application
### Using Docker
1. **Build and Run Containers**:
Ensure Docker is running on your system. From the root directory of the project, execute:

```bash
docker-compose up --build
```
This command will build and start the Docker containers for both the client and server.

2. **Access the Application**:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

### Without Docker
If you prefer to run the application without Docker:
1. **Start the Backend Server**:
```bash
cd server
npm start
```
The backend server will run on http://localhost:3001
2. **Start the Frontend Application**:
In a separate terminal window:
```bash
cd client
npm start
```
The frontend application will run on http://localhost:5173

## Acknowledgements
Inspired by Instagram's design and functionality.