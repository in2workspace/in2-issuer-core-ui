# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:22-alpine AS build-stage
WORKDIR /app
#Copy package.json and package-lock.json
COPY package*.json /app/
#The npm ci command is used to install a project with a clean slate. The npm ci command can only be used inside a project directory where a package-lock.json file is present.
RUN npm config set registry https://registry.npmmirror.com &&  \
    npm ci --ignore-scripts
COPY package.json package-lock.json /app/
COPY src /app/src
COPY angular.json /app/angular.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.app.json /app/tsconfig.app.json
COPY tsconfig.spec.json /app/tsconfig.spec.json
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration "$configuration"

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginxinc/nginx-unprivileged:stable-alpine
#Copy ci-dashboard-dist
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
#Use the root user
USER root
RUN chmod -R 754 /usr/share/nginx/html/assets/env.js &&  \
    chown nginx:nginx /usr/share/nginx/html/assets/env.js
#Use the nginx user
USER nginx
#Copy default nginx configuration
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf
# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
