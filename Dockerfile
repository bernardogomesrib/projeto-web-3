FROM node:20.15.1-alpine

RUN apk add --no-cache make gcc g++ python3

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

RUN ls -l node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
