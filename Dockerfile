FROM node:6.11-alpine

ENV PORT=8080

# Install tools
RUN npm install -g typescript

# Create app directory
RUN mkdir -p /hotspot
COPY . /hotspot
WORKDIR /hotspot

# Install app dependencies
RUN npm install

EXPOSE ${PORT}

ENTRYPOINT [ "npm", "run" ]
CMD ["start"]