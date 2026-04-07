FROM node:20-alpine

WORKDIR /app

# Copy package configurations first to leverage Docker layer caching
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY load-balancer/package*.json ./load-balancer/

# Install dependencies for all directories
RUN cd client && npm install
RUN cd server && npm install
RUN cd load-balancer && npm install

# Copy the rest of the application
COPY . .

# Build the client
RUN cd client && npm run build

# Make the start script executable
RUN chmod +x start.sh

# Expose ports:
# 3000: Node Backend API
# 3100: Load Balancer Node
# 4173: React Vite Client
EXPOSE 3000
EXPOSE 3100
EXPOSE 4173

# Start services
CMD ["./start.sh"]
