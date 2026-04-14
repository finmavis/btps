FROM node:20-alpine AS base
COPY . /app
WORKDIR /app
ENV HUSKY=0
RUN npm install

FROM base AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm install --omit=dev --ignore-scripts

FROM base AS build-env

COPY --chown=node:node . /app/
COPY --chown=node:node --from=base /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY --chown=node:node ./package.json package-lock.json /app/
COPY --chown=node:node --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --chown=node:node --from=build-env /app/build /app/build

WORKDIR /app
CMD ["npm", "run", "start"]
