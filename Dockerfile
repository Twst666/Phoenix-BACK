FROM node:lts-buster

RUN git clone https://github.com/AbhishekSuresh2/Phoenix-Backup/ /root/Phoenix-Backup

WORKDIR /root/Phoenix-Backup

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

RUN npm install


CMD ["npm", "start"]
