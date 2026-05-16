#!/bin/bash
set -e
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx
cd /var/www/matrxe
npm install && npm run build

cat > /etc/nginx/sites-available/matrxe <<'EOF'
server {
    listen 80;
    root /var/www/matrxe/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
EOF

ln -sf /etc/nginx/sites-available/matrxe /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ufw allow 80/tcp && ufw allow 22/tcp
echo "DONE! Open http://$(curl -s ifconfig.me)"