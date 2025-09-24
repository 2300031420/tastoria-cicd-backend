# Use Node.js LTS
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
