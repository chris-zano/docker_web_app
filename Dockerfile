# get a light weight node 22 image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json
COPY package*.json ./

# install dependencies
RUN npm install

# Copy the entire application code excluding those in the dockerignore
COPY . .

# Expose my application port
EXPOSE 3300

# start the application
CMD ["node", "index.js"]
