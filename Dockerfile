# Use an official Node.js runtime as the base image
FROM node:18.16

# Set the working directory within the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all source code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port that the app will run on
EXPOSE 4000

# Define the command to run your app
CMD [ "node", "src/api/server.js" ]
