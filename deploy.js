/**
 * Deployment script for Phantom Creators
 * This script can be executed with Node.js to build and deploy the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputDir: 'dist',
  assetsDir: ['js', 'css', 'images'],
  indexFile: 'index.html',
  deploymentTarget: process.env.DEPLOY_TARGET || 'local', // local, staging, production
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir);
  console.log(`Created output directory: ${config.outputDir}`);
}

// Clean output directory
const cleanOutputDir = () => {
  console.log('Cleaning output directory...');
  const files = fs.readdirSync(config.outputDir);
  for (const file of files) {
    const filePath = path.join(config.outputDir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
  console.log('Output directory cleaned');
};

// Copy assets
const copyAssets = () => {
  console.log('Copying assets...');
  for (const dir of config.assetsDir) {
    if (fs.existsSync(dir)) {
      const targetDir = path.join(config.outputDir, dir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const srcPath = path.join(dir, file);
        const destPath = path.join(targetDir, file);
        if (fs.lstatSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied: ${srcPath} → ${destPath}`);
        }
      }
    } else {
      console.warn(`Warning: Asset directory not found: ${dir}`);
    }
  }
};

// Copy and process HTML
const processHtml = () => {
  console.log('Processing HTML...');
  let html = fs.readFileSync(config.indexFile, 'utf-8');
  
  // Add cache busting query params to script and stylesheet links
  const timestamp = Date.now();
  html = html.replace(/(\.js|\.css)"/g, `$1?v=${timestamp}"`);
  
  // Add environment-specific meta tags
  const envMeta = `<meta name="environment" content="${config.deploymentTarget}">`;
  html = html.replace('</head>', `  ${envMeta}\n</head>`);
  
  fs.writeFileSync(path.join(config.outputDir, config.indexFile), html);
  console.log(`Processed: ${config.indexFile}`);
};

// Run tests before deployment
const runTests = () => {
  try {
    console.log('Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Tests failed, aborting deployment');
    return false;
  }
};

// Deploy to specified target
const deploy = () => {
  console.log(`Deploying to ${config.deploymentTarget}...`);
  
  switch (config.deploymentTarget) {
    case 'local':
      console.log(`Deployment complete. Files are available in the ${config.outputDir} directory.`);
      console.log(`To serve the files locally, run: npx http-server ./${config.outputDir}`);
      break;
    
    case 'staging':
      // Example deployment to staging
      try {
        execSync(`echo "Deploying to staging environment" && zip -r phantom-creators.zip ./${config.outputDir}`, { stdio: 'inherit' });
        console.log('Deployment package created: phantom-creators.zip');
        // In a real scenario, you'd upload this zip file to your staging server
      } catch (error) {
        console.error('Failed to create deployment package:', error);
      }
      break;
    
    case 'production':
      console.log('Production deployment requires manual confirmation');
      console.log('Please run: DEPLOY_TARGET=production CONFIRM=true node deploy.js');
      if (process.env.CONFIRM === 'true') {
        try {
          execSync(`echo "Deploying to production environment" && zip -r phantom-creators-prod.zip ./${config.outputDir}`, { stdio: 'inherit' });
          console.log('Production deployment package created: phantom-creators-prod.zip');
          // In a real scenario, you'd upload this zip file to your production server
        } catch (error) {
          console.error('Failed to create production deployment package:', error);
        }
      }
      break;
    
    default:
      console.warn(`Unknown deployment target: ${config.deploymentTarget}`);
  }
};

// Main execution
const main = () => {
  console.log(`Starting deployment to ${config.deploymentTarget}...`);
  
  // Skip tests if running with SKIP_TESTS=true
  if (process.env.SKIP_TESTS !== 'true') {
    const testsOk = runTests();
    if (!testsOk) process.exit(1);
  }
  
  cleanOutputDir();
  copyAssets();
  processHtml();
  deploy();
  
  console.log('Deployment process completed');
};

main(); 