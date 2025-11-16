FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json .
RUN npm install --production

# Bundle app source
COPY index.js ./

# Expose the internal port; actual port can be overridden via env
EXPOSE 4013

# Start the server
CMD ["npm", "run", "dev"]