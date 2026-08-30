const fs = require('fs');
let code = fs.readFileSync('frontend/components/NavBar.jsx', 'utf8');

// Hide entire navbar on mobile, or just hide the hamburger? 
// The implementation plan says: "The top navigation bar on mobile will now be ultra-minimal, showing only the official Legal Metrology Logo and the user's profile avatar."
// Actually, hiding the hamburger menu is best.

code = code.replace(/\{(\/\* Mobile Hamburger Icon \*\/)[\s\S]*?\n\s*\}\s*<\/nav>/, "      {/* Hamburger Removed for Mobile Bottom Nav */}\n    </nav>");
fs.writeFileSync('frontend/components/NavBar.jsx', code);
console.log("NAVBAR HAMBURGER REMOVED");
