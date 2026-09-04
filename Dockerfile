FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/
RUN npm install --omit=dev && npm install --prefix server --omit=dev && npm install --prefix client --include=dev
COPY server ./server
COPY client ./client
RUN npm run build --prefix client
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
