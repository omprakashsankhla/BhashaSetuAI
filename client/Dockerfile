# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Accept build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite application
RUN npm run build

# Serve stage
FROM nginx:alpine
# Copy the built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Add a simple nginx config if SPA routing is needed
# For Vite React Router, all 404s should redirect to index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
