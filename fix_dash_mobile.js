const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');

// 1. Grid from grid-cols-1 to grid-cols-2 on mobile.
code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">/g, 
  '<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10">'
);

// 2. Reduce padding in KPI cards on mobile
code = code.replace(
  /className=\{`p-6 rounded-xl/g, 
  'className={`p-4 sm:p-6 rounded-xl'
);
// Text sizes
code = code.replace(
  /<h3 className="text-3xl font-bold/g, 
  '<h3 className="text-xl sm:text-3xl font-bold'
);
code = code.replace(
  /<p className="text-sm font-medium/g, 
  '<p className="text-[11px] sm:text-sm font-medium leading-tight'
);

// Add the window state for Recharts
const stateInjection = `  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`;

code = code.replace(/  const \[stats, setStats\] = useState\(null\);\n  const router = useRouter\(\);/g, stateInjection);

// Replace YAxis and XAxis
code = code.replace(
  /<YAxis \n                    axisLine=\{false\} \n                    tickLine=\{false\} \n                    tick=\{\{ fill: '#94a3b8', fontSize: 12 \}\} \n                  \/>/g,
  '<YAxis axisLine={false} tickLine={false} tick={{ fill: \'#94a3b8\', fontSize: 12 }} width={isMobile ? 1 : 60} tickFormatter={(val) => isMobile ? \'\' : val} />'
);

code = code.replace(
  /<XAxis \n                    dataKey="rule_id" \n                    axisLine=\{false\} \n                    tickLine=\{false\} \n                    tick=\{\{ fill: '#64748b', fontSize: 12, fontWeight: 500 \}\} \n                    dy=\{16\}\n                  \/>/g,
  '<XAxis dataKey="rule_id" axisLine={false} tickLine={false} tick={{ fill: \'#64748b\', fontSize: isMobile ? 9 : 12, fontWeight: 500 }} dy={isMobile ? 8 : 16} interval={isMobile ? "preserveStartEnd" : 0} />'
);

// Fix margin on chart to remove left space on mobile
code = code.replace(
  /<BarChart data=\{graphData\} margin=\{\{ top: 10, right: 10, left: -20, bottom: 20 \}\}>/g,
  '<BarChart data={graphData} margin={{ top: 10, right: 10, left: isMobile ? -60 : -20, bottom: isMobile ? 10 : 20 }}>'
);


fs.writeFileSync('frontend/app/dashboard/page.jsx', code);
console.log("DASHBOARD MOBILE FIXED");
