FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=4012
EXPOSE 4012
CMD ["npm", "run", "dev"]