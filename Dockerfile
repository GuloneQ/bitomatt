FROM node:20-bookworm

RUN apt-get update && apt-get install -y chromium \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
