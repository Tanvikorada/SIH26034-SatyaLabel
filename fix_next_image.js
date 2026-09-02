const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

if (!code.includes("import Image from 'next/image'")) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
}

const imgRegex = /<img\s+src="\/emblem-3d\.jpg"\s+alt="3D State Emblem of India"\s+className="w-full h-full object-cover scale-110"\s+\/>/g;

if (code.match(imgRegex)) {
  code = code.replace(imgRegex, '<Image src="/emblem-3d.jpg" alt="3D State Emblem of India" fill priority className="object-cover scale-110 shadow-2xl" sizes="(max-width: 768px) 100vw, 420px" />');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("NEXT IMAGE ADDED");
} else {
  console.log("IMG NOT FOUND");
}
