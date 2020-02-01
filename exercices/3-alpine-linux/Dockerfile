# Build Stage
FROM node:12-stretch  AS build
WORKDIR /build
COPY package.json .
RUN npm install
COPY . .


# runtime stage
# this one is to run without npm and save some space, but
# do not do that man !
FROM alpine:3.10
RUN apk add --update nodejs
RUN addgroup -S node && adduser -S node -G node
USER node

RUN mkdir /home/node/code
WORKDIR /home/node/code
## copy from stage 0
COPY --from=build --chown=node:node /build .

CMD ["node", "index.js"]


