FROM node:16 as builder
WORKDIR /app
COPY . .

RUN npm i --unsafe-perm
RUN npm run build

############################################
FROM node:16
WORKDIR /app

COPY --from=builder /app/lib lib
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json

ENTRYPOINT [ "npm" ]
CMD [ "run", "start:prod" ]