FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=4015
EXPOSE 4015
CMD ["npm", "run", "dev"]