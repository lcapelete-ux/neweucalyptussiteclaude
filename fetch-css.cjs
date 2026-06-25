const https = require('https');

https.get('https://eucalyptustratados.com.br', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const cssRegex = /href="([^"]+\.css[^"]*)"/g;
    let match;
    while ((match = cssRegex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
});
