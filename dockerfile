FROM node:20.11.1-alpine

WORKDIR /app

# npm
# COPY package* . 
# yarn
# COPY *.lock .
# pnpm
# COPY *lock.yaml .

# RUN yarn install
COPY . .

# CMD ["yarn run dev"]