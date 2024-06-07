FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm i
RUN npx astro telemetry disable
RUN npm run build

FROM httpd:2.4 AS runtime
COPY --from=build /app/dist /usr/local/apache2/htdocs/
EXPOSE 80