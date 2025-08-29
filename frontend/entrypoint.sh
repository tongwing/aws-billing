#!/bin/sh

# Set BASE_PATH from environment variable
BASE_PATH=${REACT_APP_BASE_PATH:-}

# Configure nginx based on BASE_PATH
if [ -z "$BASE_PATH" ] || [ "$BASE_PATH" = "/" ]; then
    # Root path configuration
    BASE_PATH=""
    LOCATION_ROOT="root /usr/share/nginx/html;"
    echo "Serving React app from root path"
else
    # Sub-path configuration
    LOCATION_ROOT="alias /usr/share/nginx/html/;"
    echo "Serving React app from sub-path: $BASE_PATH"
fi

# Replace template variables in nginx config
export BASE_PATH LOCATION_ROOT
envsubst '${BASE_PATH} ${LOCATION_ROOT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"