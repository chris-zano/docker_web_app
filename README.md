## **Project Objective**

The goal of this project is to create a simple web server using your preferred language (e.g., Python's Flask, Node.js, or another language of choice). The steps include:

1. **Build a Docker Image**: 
   - Develop a web server in the chosen language.
   - Create a Dockerfile to containerize the application.

2. **Run the Container Locally**:
   - Use Docker to run the application locally in a containerized environment.

3. **Push the Docker Image to Docker Hub**:
   - Tag the image with an appropriate version and push it to Docker Hub for sharing and reuse.

4. **Bonus Points**: 
   - Implement Docker Compose for managing multiple containers (e.g., database + web server).
   - Utilize multi-stage builds to optimize the image size.
   - Use Docker volumes to persist data across container restarts.

### **Application Overview**

The application is designed to facilitate the sharing of documents via a web platform. In addition to sending files to an email address and viewing a list of available files, users can register and log in. Administrators may also see download data, upload files, and keep an eye on email shares, among other features.

### **Features**

#### **User Features**:
- Signup and login with email and password, including account verification.
- Password recovery for lost passwords.
- View a feed page containing a list of downloadable files.
- Search the file server for specific documents.
- Send files to an email through the platform.

#### **Admin Features**:
- Upload files with a title and description.
- View the number of downloads and the number of emails sent for each file.

## **Application URL**
The application is live at [AT-File Server](https://at-file-server.onrender.com/).

---

## **How to Clone and Get Started**

### **1. Clone the Repository**:
```bash
git clone https://github.com/chris-zano/AT_File-Server.git
cd at_file-server
```

### **2. Install Dependencies**:
Ensure you have **Node.js** and **npm** installed. Then, run:
```bash
npm install
```

### **3. Set Up Environment Variables**:
Create a `.env` file in the root directory and add the necessary environment variables:
```env
MONGO_DB_USERNAME=<your_mongo_db_username>
MONGO_DB_PASSWORD=<your_mongo_db_password>
CLUSTER_NAME=<your_cluster_name>
APP_NAME=<your_app_name>
DATABASE_NAME=<your_database_name>
SYSTEM_EMAIL=<your_system_email>
SYSTEM_EMAIL_PASSWORD=<your_system_email_password>
PORT=<your_port>
```

### **4. Run the Application**:
- For development with automatic restarts:
  ```bash
  npm run dev
  ```
- For production:
  ```bash
  npm start
  ```
- For cluster mode:
  ```bash
  npm run cluster
  ```

### **5. Access the Application**:
The application will be live at `https://localhost:8080` (or the specified port in your `.env` file).

---

## **Getting Started with Docker and Docker Compose**

### **1. Docker Setup**

The project includes a Docker configuration to build and run the application within a containerized environment. The Docker setup makes it easy to run the application consistently across different environments.

#### **Dockerfile**:
The `Dockerfile` defines the instructions for building the application image:
```dockerfile
# Use a lightweight Node.js 22 image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code excluding those in the .dockerignore
COPY . .

# Expose the application port
EXPOSE 3300

# Start the application
CMD ["node", "index.js"]
```

#### **docker-compose.yml**:
The `docker-compose.yml` file defines the service configuration for running the application in a container:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: chrisncs/at-file-server:1.0
    ports:
      - "3300:3300"
    volumes:
      - at-fs-data:/app/AT-FS

volumes:
  at-fs-data:
```

### **2. Build and Run the Docker Container**

#### **a. Build the Docker Image**

To build the Docker image and tag it with the version `1.0`:
```bash
docker-compose build
```

#### **b. Run the Application Using Docker Compose**

To start the application using Docker Compose:
```bash
docker-compose up
```
This command will:
- Build the image.
- Start the application in a container.
- Expose the application on port `3300` (or the port specified in your `.env` file).

### **3. Verify the Application**
Once the container is up and running, you can access the application at `http://localhost:3300` (or the port you’ve configured).

### **4. Alternatively, you can pull the image from dockerhub**
To pull the image run this command
```bash
docker pull chrisncs/at-file-server:1.0
```

visit docker hub to view information about the container [here](https://hub.docker.com/r/chrisncs/at-file-server)


