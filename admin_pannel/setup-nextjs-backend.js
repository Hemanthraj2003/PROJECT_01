#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Next.js Backend...\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the admin_pannel directory.');
  process.exit(1);
}

// Check if this is the admin_pannel directory
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'admin_pannel') {
  console.error('❌ Error: This script should be run from the admin_pannel directory.');
  process.exit(1);
}

console.log('✅ Found admin_pannel directory');

// Create uploads directory
const uploadsDir = path.join(currentDir, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created public/uploads directory');
} else {
  console.log('✅ public/uploads directory already exists');
}

// Create .gitkeep file in uploads directory
const gitkeepPath = path.join(uploadsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
  console.log('✅ Created .gitkeep in uploads directory');
}

// Check if .env.local exists
const envLocalPath = path.join(currentDir, '.env.local');
const envExamplePath = path.join(currentDir, '.env.example');

if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envLocalPath);
  console.log('✅ Created .env.local from .env.example');
  console.log('⚠️  Please update .env.local with your actual configuration values');
} else if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local already exists');
} else {
  console.log('⚠️  .env.example not found, please create .env.local manually');
}

// Check for Firebase service account file
const firebaseKeyPath = path.join(currentDir, '..', 'SERVER', 'carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json');
if (fs.existsSync(firebaseKeyPath)) {
  console.log('✅ Firebase service account file found (fallback available)');
} else {
  console.log('⚠️  Firebase service account file not found. Make sure to configure environment variables.');
}

// Check if lib directory exists
const libDir = path.join(currentDir, 'lib');
if (fs.existsSync(libDir)) {
  console.log('✅ lib directory exists');
} else {
  console.log('❌ lib directory not found');
}

// Check if API routes exist
const apiDir = path.join(currentDir, 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('✅ API routes directory exists');
  
  // Count API route files
  const countFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        count += countFiles(itemPath);
      } else if (item.endsWith('.ts')) {
        count++;
      }
    }
    return count;
  };
  
  const routeCount = countFiles(apiDir);
  console.log(`✅ Found ${routeCount} API route files`);
} else {
  console.log('❌ API routes directory not found');
}

console.log('\n🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Update .env.local with your configuration');
console.log('3. Start the development server: npm run dev');
console.log('4. Test the API: node test-api.js');
console.log('\n📚 Documentation:');
console.log('- API Documentation: NEXTJS_BACKEND_README.md');
console.log('- Endpoint Mapping: API_MAPPING.md');
console.log('\n🌐 The Next.js backend will be available at: http://localhost:3000/api');
