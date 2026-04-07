#!/bin/sh
set -a

# Start Server
echo "Starting backend server on port 3000..."
cd /app/server && node index.js &

# Start Load Balancer Server
echo "Starting load balancer server on port 3100..."
cd /app/load-balancer && node server.js &

# Start Load Balancer Dispatcher
echo "Starting load balancer dispatcher worker..."
cd /app/load-balancer && node dispatcher.js &

# Start Client
echo "Starting client on port 4173..."
cd /app/client && npm run preview -- --host 0.0.0.0 --port 4173 &

# Wait for all background jobs to finish
wait -n

echo "One of the processes exited unexpectedly."
exit 1
