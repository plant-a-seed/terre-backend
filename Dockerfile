FROM node:lts-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run transpile && \
    rm -r bot node_modules

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app .
RUN npm ci --only=prod
CMD ["npm", "start"]