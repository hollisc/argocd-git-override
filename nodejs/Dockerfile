ARG IMAGE=registry.access.redhat.com/ubi8/nodejs-14
FROM $IMAGE

WORKDIR /opt/app-root/src

COPY app/package*.json ./

RUN npm ci --only=production

COPY --chown=1001:0 app .
RUN chmod -R g=u .

ENV PORT=8443

ARG ENV=production
ENV NODE_ENV $ENV
ENV NODE_VERSION $NODEJS_VERSION
CMD npm run $NODE_ENV