FROM node:12-stretch
# I use that user, but it's created by the owner of the container
USER node

# I create give to that file the right of my user
COPY --chown=node:node index.js index.js

WORKDIR /home/node/code

# Add do the same that copy, and can also
# download, and unzip from the network.
ADD --chown=node:node index.js index.js

CMD ["node", "index.js"]


