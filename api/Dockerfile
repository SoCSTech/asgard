## Building
FROM node:20-alpine as base

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
# HEALTHCHECK CMD curl --fail http://localhost:3000/ || exit 1
EXPOSE 3000

CMD [ "node", "dist/server.js" ]