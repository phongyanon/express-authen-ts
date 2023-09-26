FROM  node:18-alpine

# set working directory
RUN mkdir -p /app
WORKDIR /app
ENV NODE_ENV development

# install and cache app dependencies
COPY . /app/
RUN npm install

# start app
CMD ["npm", "start"]