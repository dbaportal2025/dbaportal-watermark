#!/bin/bash
# Setup script for watermark backend on AWS Ubuntu server
# Run this script on the AWS instance (54.180.188.8)

set -e

echo "=== Watermark Backend Server Setup ==="

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "2. Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
echo "3. Installing nginx..."
sudo apt install -y nginx

# Install certbot for SSL
echo "4. Installing certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
echo "5. Setting up application directory..."
sudo mkdir -p /home/ubuntu/watermark_backend
sudo chown -R ubuntu:ubuntu /home/ubuntu/watermark_backend

# Clone or pull the repository
echo "6. Please clone the repository manually:"
echo "   cd /home/ubuntu"
echo "   git clone https://github.com/DrOksusu/watermark.git watermark_backend"
echo "   cd watermark_backend/watermark_backend"

# Install PM2 globally
echo "7. Installing PM2..."
sudo npm install -g pm2

# Setup nginx
echo "8. Setting up nginx..."
sudo cp nginx/watermark-api.conf /etc/nginx/sites-available/watermark-api.koco.me
sudo ln -sf /etc/nginx/sites-available/watermark-api.koco.me /etc/nginx/sites-enabled/
sudo nginx -t

# Get SSL certificate
echo "9. Getting SSL certificate..."
echo "   Run: sudo certbot --nginx -d watermark-api.koco.me"

# Start application with PM2
echo "10. To start the application:"
echo "    cd /home/ubuntu/watermark_backend/watermark_backend"
echo "    npm install"
echo "    npx prisma generate"
echo "    pm2 start npm --name watermark-api -- run start"
echo "    pm2 save"
echo "    pm2 startup"

echo ""
echo "=== Setup Instructions Complete ==="
echo ""
echo "Manual steps required:"
echo "1. Clone the repository"
echo "2. Create .env file with production settings"
echo "3. Run certbot for SSL"
echo "4. Start the application with PM2"
