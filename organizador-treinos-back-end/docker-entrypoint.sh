#!/bin/sh
set -e

# Write JWT keys from env vars to files at runtime.
# In production (Render), set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY as env vars
# containing the full PEM content. Newlines can be literal or escaped as \n.
if [ -n "$JWT_PRIVATE_KEY" ]; then
  printf '%b' "$JWT_PRIVATE_KEY" > /app/privateKey.pem
  export JWT_PRIVATE_KEY_PATH=/app/privateKey.pem
fi

if [ -n "$JWT_PUBLIC_KEY" ]; then
  printf '%b' "$JWT_PUBLIC_KEY" > /app/publicKey.pem
  export JWT_PUBLIC_KEY_PATH=/app/publicKey.pem
fi

exec java $JAVA_OPTS -jar /app/quarkus-app/quarkus-run.jar
