FROM node:18-bullseye

# Combine apt-get commands, pin base packages, and clean up apt cache
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl wget git python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use COPY for local files
COPY package.json /app/package.json
COPY . /app

# Install dependencies (still intentionally unpinned at npm level for test purposes)
RUN npm install

# Configure runtime port
ARG PORT=3000
EXPOSE ${PORT}

# Create non-root user and adjust permissions
RUN groupadd -r appgroup && useradd -r -g appgroup appuser && chown -R appuser:appgroup /app
USER appuser

# Use exec form for CMD
CMD ["npm", "start"]
