# Backend Service (Node 18 + Debian)
FROM node:18-bookworm

# Set working directory to /app/server
WORKDIR /app/server

# Copy backend package files
COPY server/package.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY server/ .

# Expose API port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
