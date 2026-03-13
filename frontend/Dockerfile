# Build stage
FROM node:25.2-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* package-lock.json* ./

# Cài đặt dependencies
RUN npm install --legacy-peer-deps

# Copy source và build
COPY . .
RUN npm run build

# Production stage
FROM node:25.2-alpine

WORKDIR /app

# Cài đặt 'serve' để chạy production build
RUN npm install -g serve

# Copy folder build từ builder stage
COPY --from=builder /app/dist ./dist

# Frontend chạy trên port 5173
EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Chạy trên port 5173 để khớp với Gateway configuration
CMD ["serve", "-s", "dist", "-l", "5173"]
