#!/bin/bash

# Configuration
DB_NAME="dagmawi_db"
DB_USER=$(whoami)
DB_PASS="dagmawi_pass"

echo "🚀 Starting Setup for Dagmawi Menelik Digital Service..."

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# 2. Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or psql is not in PATH."
    exit 1
fi

# 3. Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME\"" > .env
    echo "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env
    echo "PORT=5000" >> .env
fi

# Initialize Database
echo "🗄️ Initializing Database (this might ask for sudo password)..."
# Try to create db and user - this is a bit tricky but let's try a simple approach
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

echo "🔄 Running Migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding Services and Credentials..."
npx prisma db seed
node prisma/seed_credentials.js

cd ..

# 4. Setup Frontend
echo "💻 Setting up Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ SETUP COMPLETE!"
echo "------------------------------------------------"
echo "To run the project, open two terminals:"
echo "Terminal 1: cd backend && npm run dev"
echo "Terminal 2: cd frontend && npm run dev"
echo ""
echo "Default Credentials:"
echo "Admin:   0911111111 / admin123"
echo "Officer: 0900000000 / officer123"
echo "Citizen: 0909090909 / password123"
echo "------------------------------------------------"
