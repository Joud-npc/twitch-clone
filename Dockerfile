# Phase 1 : Construction (Build)
FROM node:20-alpine AS builder
WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances et génération du client Prisma
RUN npm install
RUN npx prisma generate

# Copie de tout le code source et compilation Next.js
COPY . .
RUN npm run build

# Phase 2 : Exécution (Runner) - On ne garde que l'essentiel pour que l'image soit légère
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# On récupère uniquement ce qui est nécessaire du builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Le port utilisé par Next.js
EXPOSE 3000

# Commande pour démarrer l'app
CMD ["npm", "start"]