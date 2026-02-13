const https = require('https');
const fs = require('fs');
const path = require('path');

// Get Vercel token from environment variable
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
    console.error('Error: VERCEL_TOKEN environment variable is not set.');
    console.error('Please set your Vercel token:');
    console.error('  Windows: set VERCEL_TOKEN=your-token-here');
    console.error('  Mac/Linux: export VERCEL_TOKEN=your-token-here');
    console.error('\nTo get your token:');
    console.error('1. Go to https://vercel.com/account/tokens');
    console.error('2. Click "Create Token"');
    console.error('3. Copy the token and set it as above');
    process.exit(1);
}

const projectName = 'truth';
const teamId = ''; // Leave empty for personal account

// Get all files in the directory
function getFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== '.git') {
                files.push(...getFiles(fullPath));
            }
        } else {
            const relativePath = path.relative(process.cwd(), fullPath);
            files.push({
                file: relativePath,
                data: fs.readFileSync(fullPath)
            });
        }
    }
    return files;
}

// Create a deployment
async function deploy() {
    console.log('Creating deployment...');
    
    const files = getFiles('.');
    
    // Create the deployment payload
    const deploymentPayload = {
        name: projectName,
        files: files.map(f => ({
            file: f.file,
            data: f.data.toString('base64'),
            encoding: 'base64'
        })),
        projectSettings: {
            framework: null,
            buildCommand: null,
            outputDirectory: '.',
            rootDirectory: null
        }
    };

    const postData = JSON.stringify(deploymentPayload);
    
    const options = {
        hostname: 'api.vercel.com',
        path: `/v6/deployments${teamId ? `?teamId=${teamId}` : ''}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log('Deployment created successfully!');
                    console.log('URL:', response.url);
                    console.log('Production URL:', response.inspectorUrl || response.url);
                } else {
                    console.error('Deployment failed:');
                    console.error(JSON.stringify(response, null, 2));
                }
            } catch (e) {
                console.error('Error parsing response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(postData);
    req.end();
}

deploy();
