const https = require('https');

const data = JSON.stringify({
  jsonrpc: '2.0',
  method: 'tools/call',
  params: {
    name: 'get_screen',
    arguments: {
      projectId: '7790414929306714616',
      screenId: '13448326396032736940'
    }
  },
  id: 1
});

const options = {
  hostname: 'stitch.googleapis.com',
  port: 443,
  path: '/mcp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.STITCH_API_KEY || '',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw body:', body);
    }
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
