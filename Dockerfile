FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3 \
    gcc \
    g++ \
    php-cli \
    golang-go \
    rustc \
    cargo \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]