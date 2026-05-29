#!/bin/sh
set -e

cd /app

if [ ! -d node_modules ]; then
    npm install --no-audit --no-fund
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec npm run dev -- --hostname 0.0.0.0 --port 3000
