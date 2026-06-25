const https = require('https');

https.get('https://eucalyptustratados.com.br', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const hexRegex = /#[0-9a-fA-F]{3,6}/g;
    const matches = data.match(hexRegex) || [];
    const counts = {};
    matches.forEach(m => {
      const lower = m.toLowerCase();
      counts[lower] = (counts[lower] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
    console.log('Top colors:', sorted);
  });
});
