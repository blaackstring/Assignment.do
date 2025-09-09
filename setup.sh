#!/bin/bash

echo "🚀 Starting Habit Tracker App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB running or use MongoDB Atlas."
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔧 Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f "../backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > ../backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EOF
fi

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm run dev"
echo ""
echo "The app will be available at:"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo ""
echo "Make sure MongoDB is running on your system or update the MONGODB_URI in backend/.env"

