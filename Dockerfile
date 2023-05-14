FROM node:16

WORKDIR /app

COPY package*.json ./


RUN npm install
RUN npm install --save mysql2

COPY . .

EXPOSE 5000
CMD [ "node", "app.js" ]