FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Expose Vite default port
EXPOSE 5173

# Start Vite dev server with host flag for external access
CMD ["npx", "vite", "--host"]
