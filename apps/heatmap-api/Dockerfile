FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=4014
EXPOSE 4014
CMD ["npm", "run", "dev"]