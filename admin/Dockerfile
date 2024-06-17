FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm i
RUN npx astro telemetry disable
RUN npm run build

FROM node:20-alpine AS runtime
COPY --from=build /app/ /app/
RUN chown -R node:node /app
WORKDIR /app/node-runner
RUN npm i
USER node

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80
CMD ["npm", "start"]