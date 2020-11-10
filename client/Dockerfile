# Step 1: Build phase, build production source files
FROM node:alpine
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
CMD npm run build

# Step 2: Run Phase, use nginx server
FROM nginx
# expose port 3000 to allow nginx router server to talk to client nginx server 
EXPOSE 3000
# copy defined nginx conf to container nginx config location to apply config changes to nginx server container
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy from files from build step 1 (0) to nginx location for static hosting client files 
COPY --from=0 /app/build /usr/share/nginx/html