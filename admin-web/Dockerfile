# ----------------------
# Stage 1: Build locally
# ----------------------
FROM node:20 as build-stage

# Copy packages into work directory
WORKDIR /app
COPY package*.json /app

# Install packages, copy them, run build
RUN npm install
COPY ./ /app/
RUN npm run build

# Expose port 80
EXPOSE 80

# ---------------------------------
# Stage 2: Copy to nginx and deploy
# ---------------------------------
FROM nginx as deploy-stage
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

