const fs = require('fs');
let code = fs.readFileSync('frontend/app/settings/page.jsx', 'utf8');

// 1. Add state for notifications
code = code.replace(/const \[mounted, setMounted\] = useState\(false\);/, "const [mounted, setMounted] = useState(false);\n  const [notifications, setNotifications] = useState(true);");

// 2. Fix Push Notifications toggle
code = code.replace(/<input type="checkbox" className="sr-only peer" defaultChecked \/>/g, 
  `<input type="checkbox" className="sr-only peer" checked={notifications} onChange={(e) => { setNotifications(e.target.checked); toast.success(e.target.checked ? 'Push notifications enabled' : 'Push notifications disabled'); }} />`);

// 3. Fix Manage button
code = code.replace(/<button className="text-\[13px\] font-medium text-\[var\(--color-text-muted\)\] hover:text-\[var\(--color-primary\)\]">Manage<\/button>/g, 
  `<button onClick={() => toast.info('Telemetry and diagnostic logs are managed by your department administrator.')} className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active-press">Manage</button>`);

// 4. Fix View Details button
code = code.replace(/<button className="text-\[13px\] font-medium text-\[var\(--color-text-muted\)\] hover:text-\[var\(--color-primary\)\]">View Details<\/button>/g, 
  `<button onClick={() => toast.success('SatyaLabel Legal Metrology Engine v2.0.4 (Enterprise Build). All core OCR systems operational.')} className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active-press">View Details</button>`);

fs.writeFileSync('frontend/app/settings/page.jsx', code);
console.log("SETTINGS BUTTONS WIRED");
