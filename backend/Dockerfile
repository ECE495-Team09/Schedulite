FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY version.json /version.json

EXPOSE 8080

CMD ["npm", "start"]