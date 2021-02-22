# This Docker file will be built in the docker-compose.yml
# use Cypress provided image with all dependencies included
FROM cypress/included:6.5.0
# copy necessary packages
COPY package.json ./
COPY package-lock.json ./
# install NPM dependencies and Cypress binary
RUN npm ci
# check if the binary was installed successfully
RUN $(npm bin)/cypress verify