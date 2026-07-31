# Use official Node.js lightweight Alpine image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (only production)
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create the secret directory required for Level 3 challenge
RUN mkdir -p /tmp/shadow_realm && chmod 777 /tmp/shadow_realm

# Expose web server port
EXPOSE 3000

# Start application directly with Node (bypasses npm signal issues)
CMD ["node", "app.js"]