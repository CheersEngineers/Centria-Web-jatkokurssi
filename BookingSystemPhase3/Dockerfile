# ---- Base image ----
FROM node:20-alpine

# ---- Create app directory ----
WORKDIR /usr/src/app

# ---- Copy package files first (better caching) ----
COPY package*.json ./

# ---- Install dependencies (use package-lock if present) ----
# Use npm ci when package-lock.json exists for reproducible installs
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---- Copy the rest of the project ----
COPY . .

# ---- Expose port (use env PORT at runtime) ----
ENV PORT=5001
EXPOSE 5001

# ---- Default command ----
CMD ["node", "index.js"]