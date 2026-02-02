#!/bin/bash
set -e

cd /src/build-your-own-radar

echo "Starting webpack build with env:"
echo "  BACKEND_URL=${BACKEND_URL}"
echo "  ALLOW_PUBLIC_URLS=${ALLOW_PUBLIC_URLS}"
echo "  RADAR_DATA_URL=${RADAR_DATA_URL}"
npm run build:prod

echo "Copying built files to nginx directories..."
mkdir -p /opt/build-your-own-radar
cd /opt/build-your-own-radar
cp -r /src/build-your-own-radar/dist/* ./
mkdir -p files
cp /src/build-your-own-radar/spec/end_to_end_tests/resources/localfiles/* ./files/
cp /src/build-your-own-radar/default.template /etc/nginx/conf.d/default.conf

echo "Starting backend..."
npm run backend &

echo "Starting nginx server..."
exec nginx -g 'daemon off;'
