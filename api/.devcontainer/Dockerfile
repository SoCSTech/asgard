# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=22
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Install Ping (for debugging)
RUN apt-get update && apt-get install -y iputils-ping

# Add CLS is Clear alias
RUN ln -L /usr/bin/clear /usr/bin/cls