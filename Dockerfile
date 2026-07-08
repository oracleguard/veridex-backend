FROM node:20-bookworm-slim

WORKDIR /app
COPY package*.json .
RUN npm ci

COPY src/ src/
COPY tsconfig.json .
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/main.js"]
