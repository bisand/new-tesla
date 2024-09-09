# Step 1: Build the application
FROM node:alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Step 2: Create the runtime image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app .

# Expose the port the application runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "server.js"]