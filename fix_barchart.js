const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');

const oldXAxis = `<XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 12, fontWeight: 500 }} dy={isMobile ? 8 : 16} interval={isMobile ? "preserveStartEnd" : 0} />`;
const newXAxis = `<XAxis 
                    dataKey="rule_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 11, fontWeight: 500 }} 
                    dy={isMobile ? 8 : 12} 
                    interval="preserveStartEnd" 
                    tickFormatter={(val) => val.replace(/Rule /g, 'R')}
                  />`;

const oldCell = `<Cell key={\`cell-\${index}\`} fill={index === 0 ? '#1E3A8A' : '#3B82F6'} className="dark:opacity-90 hover:opacity-80 transition-opacity" />`;
const newCell = `<Cell key={\`cell-\${index}\`} fill={index === 0 ? '#0f172a' : '#64748b'} className="dark:opacity-90 hover:opacity-80 transition-opacity" />`;

code = code.replace(oldXAxis, newXAxis);
code = code.replace(oldCell, newCell);

fs.writeFileSync('frontend/app/dashboard/page.jsx', code);
console.log("CHART FIXED");
