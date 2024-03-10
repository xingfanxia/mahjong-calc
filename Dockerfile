FROM node:latest

# Create a new directory for the application and set it as
# the working directory for the commands that follow
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the image
COPY package*.json ./

# Install Node.js dependencies defined in package.json
RUN npm install

# Copy the entire project into the container
COPY . .

ENV PATH $PATH:/home/node/.cargo/bin

# Install Rust and wasm-pack
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && export PATH="$HOME/.cargo/bin:$PATH" \
  && rustup default stable \
  && cargo install wasm-pack

ENV PATH="/root/.cache/.wasm-pack/.wasm-bindgen-cargo-install-0.2.92/bin:${PATH}"

# Run the custom script to build WebAssembly, ensuring PATH is set
RUN export PATH="$HOME/.cargo/bin:$PATH" && npm run build:wasm

# Set the command to be executed when the Docker container starts
CMD ["npm", "run", "dev"]
