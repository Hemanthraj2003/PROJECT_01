#!/bin/bash

echo "========================================"
echo "   Friends Cars - Development Setup"
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "ERROR: Node.js is not installed or not in PATH"
    print_error "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "ERROR: npm is not installed or not in PATH"
    exit 1
fi

print_success "Node.js and npm are installed. Proceeding with setup..."
echo

# Install SERVER dependencies
print_status "========================================"
print_status "Installing SERVER dependencies..."
print_status "========================================"
cd SERVER
if [ -f "package.json" ]; then
    print_status "Installing server dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "ERROR: Failed to install server dependencies"
        exit 1
    fi
    print_success "Server dependencies installed successfully!"
else
    print_error "ERROR: SERVER/package.json not found"
    exit 1
fi
cd ..
echo

# Install CarApp dependencies
print_status "========================================"
print_status "Installing CarApp dependencies..."
print_status "========================================"
cd CarApp
if [ -f "package.json" ]; then
    print_status "Installing CarApp dependencies with --legacy-peer-deps..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        print_error "ERROR: Failed to install CarApp dependencies"
        exit 1
    fi
    print_success "CarApp dependencies installed successfully!"
else
    print_error "ERROR: CarApp/package.json not found"
    exit 1
fi
cd ..
echo

# Install Admin Panel dependencies
print_status "========================================"
print_status "Installing Admin Panel dependencies..."
print_status "========================================"
cd admin_pannel
if [ -f "package.json" ]; then
    print_status "Installing admin panel dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "ERROR: Failed to install admin panel dependencies"
        exit 1
    fi
    print_success "Admin panel dependencies installed successfully!"
else
    print_error "ERROR: admin_pannel/package.json not found"
    exit 1
fi
cd ..
echo

print_success "========================================"
print_success "   Setup completed successfully!"
print_success "========================================"
echo
print_status "To start the development environment, run:"
print_status "  ./start-dev.sh (Linux/Mac)"
print_status "  start-dev.bat (Windows)"
echo
