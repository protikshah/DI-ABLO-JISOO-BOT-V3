FROM node:18-bullseye-slim

# Install system dependencies for canvas and gifencoder
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    giflib-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "index.js"]
