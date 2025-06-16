#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Friends Cars Development Setup...\n");

const projects = [
  { name: "SERVER", path: "./SERVER" },
  { name: "CarApp", path: "./CarApp" },
  { name: "Admin Panel", path: "./admin_pannel" },
];

let allGood = true;

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

console.log(`📦 Node.js version: ${nodeVersion}`);
if (majorVersion < 16) {
  console.log("❌ Node.js version 16 or higher is required");
  allGood = false;
} else {
  console.log("✅ Node.js version is compatible");
}
console.log();

// Check each project
projects.forEach((project) => {
  console.log(`🔍 Checking ${project.name}...`);

  const projectPath = path.resolve(project.path);
  const packageJsonPath = path.join(projectPath, "package.json");
  const nodeModulesPath = path.join(projectPath, "node_modules");

  // Check if project directory exists
  if (!fs.existsSync(projectPath)) {
    console.log(`❌ ${project.name} directory not found at ${project.path}`);
    allGood = false;
    return;
  }

  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ ${project.name} package.json not found`);
    allGood = false;
    return;
  }

  // Check if node_modules exists
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(
      `⚠️  ${project.name} dependencies not installed (node_modules missing)`
    );
    console.log(
      `   Run: cd ${project.path} && npm install${
        project.name === "CarApp" ? " --legacy-peer-deps" : ""
      }`
    );
    allGood = false;
    return;
  }

  console.log(`✅ ${project.name} setup looks good`);
});

console.log();

// Check for environment files
console.log("🔍 Checking environment configuration...");

const configFiles = [
  { name: "CarApp .env.example", path: "./CarApp/.env.example" },
  { name: "Admin Panel .env.example", path: "./admin_pannel/.env.example" },
  {
    name: "SERVER Firebase Certificate",
    path: "./SERVER/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json",
  },
  {
    name: "Admin Panel Firebase Certificate",
    path: "./admin_pannel/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json",
  },
];

configFiles.forEach((configFile) => {
  if (fs.existsSync(configFile.path)) {
    console.log(`✅ ${configFile.name} found`);
  } else {
    if (configFile.name.includes("Firebase Certificate")) {
      console.log(
        `⚠️  ${configFile.name} not found - Please add your Firebase service account file`
      );
    } else {
      console.log(`⚠️  ${configFile.name} not found`);
    }
  }
});

console.log();

// Final status
if (allGood) {
  console.log("🎉 All checks passed! Your development environment is ready.");
  console.log("");
  console.log("To start development:");
  console.log("  npm run dev");
  console.log("");
  console.log("Or use platform-specific scripts:");
  console.log("  Windows: start-dev.bat");
  console.log("  Linux/Mac: ./start-dev.sh");
} else {
  console.log(
    "❌ Some issues were found. Please fix them before starting development."
  );
  console.log("");
  console.log("Quick fix commands:");
  console.log("  npm run setup    # Install all dependencies");
  console.log("  npm run clean    # Clean all node_modules");
  console.log("  npm run reinstall # Clean and reinstall everything");
}

console.log();
