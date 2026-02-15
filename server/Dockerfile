FROM node:22-alpine 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENTRYPOINT ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start:prod"]