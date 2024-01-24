# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=20
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# # Install mysql client
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get install -y mysql-shell \ 
#     && apt-get clean -y && rm -rf /var/lib/apt/lists/*