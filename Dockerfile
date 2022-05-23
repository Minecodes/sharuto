FROM ubuntu:latest

COPY . .

RUN apt update && apt upgrade -y && apt install curl wget git -y
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm i -g && npm i && npm run build

CMD [ "npm start" ]