# syntax=docker/dockerfile:1
ARG NODE_VERSION=26.13.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production
WORKDIR /home/node/app
RUN chown node:node .
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node . .
RUN mkdir -p data/music

EXPOSE 3000
CMD ["npm", "start"]
