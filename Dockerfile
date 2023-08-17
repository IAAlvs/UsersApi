# Use a newer version of Node.js
FROM node:18-alpine

# Create the application directory
WORKDIR /app

# Copy application configuration files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (excluding dev dependencies)
RUN npm ci --omit=dev

# Copy compiled files to the container
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Compile TypeScript code
RUN npm run build

# Expose the port
EXPOSE 8080


# Run the server
CMD [ "node", "dist/api/server.js" ]
