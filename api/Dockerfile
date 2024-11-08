FROM node:20-alpine as base

# Open Container Initiative (OCI) labels
LABEL org.opencontainers.image.title "Asgard API"
LABEL org.opencontainers.image.description "Main API for the Asgard System"
LABEL org.opencontainers.image.authors ["University of Lincoln - Computer Science Technical Services <technician@lincoln.ac.uk>","Josh Cooper <joshcooper@lincoln.ac.uk>"]
LABEL org.opencontainers.image.url "https://github.com/socstech/asgard"
LABEL org.opencontainers.image.licenses="Apache-2.0"

# Make things run as node user
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY drizzle.config.ts ./

# If you are building your code for production
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build

ENV NODE_PATH=./dist

# # Add a healthcheck and a port forward
# HEALTHCHECK CMD curl --fail http://localhost:3000/v2 || exit 1
EXPOSE 3000

CMD [ "node", "dist/server.js" ]