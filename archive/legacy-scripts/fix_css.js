const fs = require('fs');
let code = fs.readFileSync('frontend/app/globals.css', 'utf8');

if (!code.includes('animate-pulse-slow')) {
  code += `\n
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fill-bar {
  from { width: 0%; }
}
.animate-fill-bar {
  animation: fill-bar 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes stroke-dash {
  from { stroke-dasharray: 0, 100; }
}
.animate-stroke-dash {
  animation: stroke-dash 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Premium Glass Hover State */
.glass {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
}
.glass:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.1);
}
`;
  fs.writeFileSync('frontend/app/globals.css', code);
  console.log("CSS UPDATED");
} else {
  console.log("ALREADY THERE");
}
