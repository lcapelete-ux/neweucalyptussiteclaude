const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace emerald with brand
content = content.replace(/emerald-/g, 'brand-');

// Adjust weights for brand colors to match the new palette
// We want the primary color to be brand-500 (#afca0b)
// Currently, buttons are bg-brand-700. Let's change bg-brand-700 to bg-brand-500
// hover:bg-brand-800 to hover:bg-brand-600
// text-brand-700 to text-brand-600
// text-brand-800 to text-brand-700
// text-brand-900 to text-brand-800
// bg-brand-900 to bg-brand-800
// text-brand-400 to text-brand-400 (light lime)
// border-brand-200 to border-brand-300

content = content.replace(/bg-brand-700/g, 'bg-brand-500');
content = content.replace(/hover:bg-brand-800/g, 'hover:bg-brand-600');
content = content.replace(/text-brand-700/g, 'text-brand-600');
content = content.replace(/text-brand-800/g, 'text-brand-700');
content = content.replace(/text-brand-900/g, 'text-brand-800');
content = content.replace(/bg-brand-900/g, 'bg-brand-800');
content = content.replace(/from-brand-700/g, 'from-brand-600');
content = content.replace(/to-brand-900/g, 'to-brand-800');
content = content.replace(/border-brand-200/g, 'border-brand-300');

fs.writeFileSync(file, content);
console.log('Replaced emerald with brand and adjusted weights');
