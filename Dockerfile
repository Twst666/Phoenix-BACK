FROM node:lts-buster

RUN git clone https://github.com/Twst666/Phoenix-BACK/ /root/Phoenix-BACK

WORKDIR /root/Phoenix-BACK

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

RUN npm install


CMD ["npm", "start"]
