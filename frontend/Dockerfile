FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./

# Instead of npm ci, use npm install to sync package-lock with package.json
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
