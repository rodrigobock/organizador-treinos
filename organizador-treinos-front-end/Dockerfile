# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .

# Build the React app
ENV REACT_APP_API_URL=http://localhost:8080
RUN npm run build

# Stage 2: Runtime (serve with nginx)
FROM node:18-alpine

WORKDIR /app

# Install serve to run the development server
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /build/build ./build

# Copy package.json to /app for npm start
COPY --from=builder /build/package*.json ./

EXPOSE 3000

# Start the app in development mode for docker-compose
CMD ["serve", "-s", "build", "-l", "3000"]
