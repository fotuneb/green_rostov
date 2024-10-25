FROM node:18.7-alpine

WORKDIR /app/frontend

COPY package.json ./
# RUN ls > test
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run-script", "start"]