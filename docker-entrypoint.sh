#!/bin/sh

# Run migrations
npx prisma migrate deploy

# Determine the appropriate command based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    # Start the Production server
    yarn run build
else
    # Start the development server
    yarn run debug
fi
