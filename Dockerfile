FROM node:20 as build

WORKDIR /app
COPY . .

ENV YARN_CACHE_FOLDER=/root/.yarn
RUN yarn install --frozen-lockfile
RUN yarn build

FROM --platform=linux/amd64 node:20-alpine
COPY --from=build /app/dist dist

EXPOSE 5000

CMD ["node", "dist/index.js"]

