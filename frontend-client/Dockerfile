# syntax=docker/dockerfile:1
ARG NODE_VERSION=26.13.0
FROM node:${NODE_VERSION}-alpine

WORKDIR /home/node/app
RUN chown node:node .
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY --chown=node:node . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
