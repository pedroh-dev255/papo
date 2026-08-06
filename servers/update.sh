#!/bin/bash

set -e

cd "$(dirname "$0")"

set -a
source .env
set +a

envsubst < templates/livekit.yaml.template > generated/livekit.yaml
envsubst < templates/turnserver.conf.template > generated/turnserver.conf
envsubst < templates/nginx.conf.template > generated/nginx.conf

docker compose down
docker compose up -d