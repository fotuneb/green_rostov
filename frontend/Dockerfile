FROM node:18.7-alpine

WORKDIR /app/frontend
RUN rm -rf node_modules .next .cache dist
COPY package*.json ./
# RUN ls > test
RUN npm install
RUN chown -R node:node /app/frontend

COPY . .

EXPOSE 3000
CMD ["npm", "run-script", "start"]