#testing testing

# 1. Använd en officiell Node-bild som bas för byggfasen
FROM node:18-alpine AS builder

# 2. Ange arbetsmappen i containern
WORKDIR /app

# 3. Kopiera package.json och package-lock.json för att installera beroenden
COPY package*.json ./

# 4. Installera beroenden
RUN npm install --frozen-lockfile

# 5. Kopiera hela projektkoden till arbetsmappen i containern
COPY . .

# 6. Bygg projektet för produktion
RUN npm run build

# 7. Ta bort onödiga beroenden för produktion
RUN npm prune --production

# 8. Använd en mindre Node-bild för att köra Next.js-applikationen
FROM node:18-alpine AS runner

# 9. Ange arbetsmappen och kopiera byggresultatet från builder-steget
WORKDIR /app
COPY --from=builder /app/ .

# 10. Ställ in NODE_ENV till production
ENV NODE_ENV=production

# 11. Exponera en port för att köra applikationen (justera om nödvändigt)
EXPOSE 3001

# 12. Ange startkommandot för att köra Next.js-applikationen
CMD ["npm", "start"]
