const https = require('https');

https.get('https://eucalyptustratados.com.br', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // find elements with background color or color matching afca0b
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('afca0b')) {
        console.log(line.trim());
      }
    });
  });
});
