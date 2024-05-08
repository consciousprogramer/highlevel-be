#!/bin/sh

# Run migrations
npx prisma migrate deploy

# Start the development server
yarn run debug
