# ---- Base image ----
FROM node:20-alpine

# ---- Create app directory ----
WORKDIR /usr/src/app

# ---- Copy package files first (better caching) ----
COPY package*.json ./

# ---- Install production dependencies ----
RUN npm install --omit=dev

# ---- Copy the rest of the project ----
COPY . .

# ---- Default command ----
CMD ["node", "index.js"]
