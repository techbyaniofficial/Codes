FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY src ./src

ENV NODE_ENV=production

EXPOSE 8080

USER node

CMD ["node", "src/server.js"]