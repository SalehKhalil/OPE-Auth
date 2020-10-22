FROM node:alpine

RUN mkdir /usr/ope-auth
WORKDIR /usr/ope-auth

COPY package.json package-lock.json ./
RUN npm i

COPY . ./

EXPOSE 3000

CMD node src/index.js
