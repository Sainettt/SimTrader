FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

ENTRYPOINT ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start:prod"]