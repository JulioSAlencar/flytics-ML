FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila TypeScript
RUN npx tsc

EXPOSE 3001

CMD ["npm", "run", "dev"]
