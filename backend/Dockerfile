# Stage 1: Build TypeScript with npm
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json tsconfig.json ./
#same as npm install but for production (keeps the correct version, optimized for size etc.)
RUN npm ci 

# Copy and compile source
COPY src ./src
RUN npm run build         


# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Copy built assets and production deps
COPY package.json package-lock.json ./

#install production dependencies
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY public ./public
COPY uploads ./uploads

#set enviroment
ENV NODE_ENV=production
#load production variables
# COPY .env ./

# Create uploads directory and set permissions
RUN mkdir -p uploads/profile uploads/email_images public/images/icons
RUN chmod -R 755 uploads/ public/

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000
CMD ["node", "dist/index.js"]