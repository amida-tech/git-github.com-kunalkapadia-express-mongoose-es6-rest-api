# Use latest node maintenance LTS version 14.20.x
FROM node:fermium-alpine3.16

LABEL maintainer="Marc Sylvestre <marc.sylvestre@manhydra.com>"

# create app directory in container
RUN mkdir -p /app

# set /app directory as default working directory
WORKDIR /app

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /app/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /app/

# expose port 4040
EXPOSE 4040

# cmd to start service
CMD [ "yarn", "start" ]
