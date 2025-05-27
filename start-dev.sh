#!/bin/bash

echo "========================================"
echo "   Friends Cars - Starting Development"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Check if dependencies are installed
if [ ! -d "SERVER/node_modules" ]; then
    print_error "ERROR: Server dependencies not found. Please run ./setup-dev.sh first."
    exit 1
fi

if [ ! -d "CarApp/node_modules" ]; then
    print_error "ERROR: CarApp dependencies not found. Please run ./setup-dev.sh first."
    exit 1
fi

if [ ! -d "admin_pannel/node_modules" ]; then
    print_error "ERROR: Admin panel dependencies not found. Please run ./setup-dev.sh first."
    exit 1
fi

print_status "Starting all services..."
echo
print_status "Services will start in the following order:"
print_status "1. Backend Server (PORT: 5000)"
print_status "2. Admin Panel (PORT: 3000)"
print_status "3. CarApp (Expo Development Server)"
echo
print_warning "Press Ctrl+C to stop all services"
echo

# Function to cleanup background processes
cleanup() {
    print_warning "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Backend Server
print_status "Starting Backend Server..."
cd SERVER
npm start &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Start Admin Panel
print_status "Starting Admin Panel..."
cd admin_pannel
npm run dev &
ADMIN_PID=$!
cd ..

# Wait a moment for admin panel to start
sleep 3

# Start CarApp
print_status "Starting CarApp..."
cd CarApp
npm start &
CARAPP_PID=$!
cd ..

echo
print_success "========================================"
print_success "   All services started successfully!"
print_success "========================================"
echo
print_status "Services running:"
print_status "- Backend Server: http://localhost:5000"
print_status "- Admin Panel: http://localhost:3000"
print_status "- CarApp: Follow Expo CLI instructions"
echo
print_warning "Press Ctrl+C to stop all services"
echo

# Wait for all background processes
wait
