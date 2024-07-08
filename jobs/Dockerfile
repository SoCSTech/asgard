## Building
FROM node:20-alpine as base

# Make things run as node user
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# If you are building your code for production
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build

ENV NODE_PATH=./dist

CMD [ "node", "dist/index.js" ]