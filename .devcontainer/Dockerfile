FROM node:18.17.1

ENV PUPPETEER_SKIP_DOWNLOAD true

RUN apt update
RUN apt install -y libgif7 

RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN apt-get install -y python3

RUN npm install -g depcheck