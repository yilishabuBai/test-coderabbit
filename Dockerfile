# Hadolint test Dockerfile — intentionally contains common Dockerfile issues

# Issue 1: Using latest tag
FROM node:latest

# Issue 2: Running as root (no USER instruction)
# Issue 3: Multiple RUN instructions that should be combined
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN apt-get install -y git

# Issue 4: Not cleaning up apt cache
RUN apt-get install -y python3

# Issue 5: Using ADD instead of COPY for local files
ADD package.json /app/package.json
ADD . /app

# Issue 6: Not pinning package versions
RUN npm install

# Issue 7: Using WORKDIR after COPY
COPY . /app
WORKDIR /app

# Issue 8: EXPOSE using a variable
ARG PORT=3000
EXPOSE $PORT

# Issue 9: Using shell form instead of exec form for CMD
CMD npm start

# Issue 10: No HEALTHCHECK defined
# Issue 11: Using sudo in container
RUN sudo chmod -R 777 /app || true
