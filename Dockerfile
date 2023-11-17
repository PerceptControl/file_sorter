FROM node:lts

ENV EXEC=true
VOLUME /config
VOLUME /dst

WORKDIR /node
COPY package*.json ./
RUN npm ci

COPY . .

CMD ["ls", "/config"]
ENTRYPOINT npm run example