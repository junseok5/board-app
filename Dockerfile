# Use the official Node.js 22.14.0 image as the base image
FROM node:22.14.0

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start:prod"]