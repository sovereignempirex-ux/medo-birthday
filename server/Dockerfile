FROM node:18-alpine AS builder
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY client/package*.json ./client/
RUN cd client && npm install
COPY . .
RUN cd client && npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY --from=builder /app/server .
COPY --from=builder /app/client/dist ./dist
RUN npm install --production
EXPOSE 10000
CMD ["node", "server.js"]