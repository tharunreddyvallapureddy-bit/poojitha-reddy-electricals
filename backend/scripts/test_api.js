const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting programmatic API testing...');

// Launch Express server
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: '5050' } // run on different port to avoid conflicts
});

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('[Server STDOUT]:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error('[Server STDERR]:', data.toString().trim());
});

// Wait for server to start
setTimeout(() => {
  // Make a request to root "/"
  const req = http.get('http://localhost:5050/', (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('-----------------------------------');
      console.log('Root Endpoint check:');
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', body);
      console.log('-----------------------------------');
      
      // Make a request to fetch booking track details
      const trackReq = http.get('http://localhost:5050/api/bookings/track/PRE-E4X789', (trackRes) => {
        let trackBody = '';
        trackRes.on('data', (chunk) => trackBody += chunk);
        trackRes.on('end', () => {
          console.log('Booking Tracker Endpoint check (PRE-E4X789):');
          console.log('Status Code:', trackRes.statusCode);
          console.log('Response Body:', trackBody);
          console.log('-----------------------------------');
          
          // Test Admin Login Endpoint
          const postData = JSON.stringify({
            username: 'admin',
            password: 'Vinay@8498870697'
          });
          
          const options = {
            hostname: 'localhost',
            port: 5050,
            path: '/api/auth/admin/login',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          };
          
          const loginReq = http.request(options, (loginRes) => {
            let loginBody = '';
            loginRes.on('data', (chunk) => loginBody += chunk);
            loginRes.on('end', () => {
              console.log('Admin Authentication check:');
              console.log('Status Code:', loginRes.statusCode);
              console.log('Response Body:', loginBody);
              console.log('-----------------------------------');
              
              // Shutdown server and exit
              console.log('All API tests completed. Shutting down server.');
              serverProcess.kill();
              
              const allPassed = res.statusCode === 200 && trackRes.statusCode === 200 && loginRes.statusCode === 200;
              process.exit(allPassed ? 0 : 1);
            });
          });
          
          loginReq.on('error', (err) => {
            console.error('Login request failed:', err);
            serverProcess.kill();
            process.exit(1);
          });
          
          loginReq.write(postData);
          loginReq.end();
        });
      });
      
      trackReq.on('error', (err) => {
        console.error('Tracker check failed:', err);
        serverProcess.kill();
        process.exit(1);
      });
    });
  });

  req.on('error', (err) => {
    console.error('Root endpoint check failed:', err);
    serverProcess.kill();
    process.exit(1);
  });
}, 3000); // Wait 3 seconds for boot
