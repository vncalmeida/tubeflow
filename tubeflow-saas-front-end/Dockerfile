# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

# Etapa final (somente arquivos necessários)
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

ENV PORT=3100

EXPOSE $PORT

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3100"]
