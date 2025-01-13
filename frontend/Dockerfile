# Use a newer Node.js version
FROM node:18.12-alpine

# Install pnpm
RUN npm install -g pnpm

# Setup workdir
WORKDIR /app/frontend

# Сlean node_modules and setup package files
RUN rm -rf node_modules .next .cache dist
COPY package.json pnpm-lock.yaml ./

# RUN ls > test
RUN pnpm install
RUN chown -R node:node /app/frontend

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]