FROM node:6.11-alpine

ENV HTTP_PORT=80
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Install tools
RUN npm install -g typescript

# Create app directory
RUN mkdir -p /hotspot
WORKDIR /hotspot

# Bundle app source
COPY . /hotspot

# Install app dependencies
RUN npm install

EXPOSE $HTTP_PORT

CMD ["npm", "start"]