# Specify a concrete version of the Node.js image using an Alpine variant for reduced size
FROM node:16-alpine

# Create a new directory for the application
WORKDIR /app

# Set the path to include the cargo bin directory
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Rust, wasm-pack, and build essentials like gcc, make, libc-dev
RUN apk add --no-cache curl build-base && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable && \
    cargo install wasm-pack

# Copy package.json and package-lock.json (if available) to the image
# and install Node.js dependencies defined in package.json
COPY package*.json ./
RUN npm install

# Copy the rest of your application source code
COPY . .

# Execute the script to build WebAssembly
RUN npm run build:wasm
RUN npm run build
# Set the command to be executed when the Docker container starts
CMD ["npm", "start"]
