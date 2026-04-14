FROM node:20-alpine AS base
COPY . /app
WORKDIR /app
RUN npm install

FROM base AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm install --omit=dev --ignore-scripts

FROM base AS build-env

COPY --chown=app:app . /app/
COPY --chown=app:app --from=base /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY --chown=app:app ./package.json package-lock.json /app/
COPY --chown=app:app --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --chown=app:app --from=build-env /app/build /app/build

WORKDIR /app
CMD ["npm", "run", "start"]