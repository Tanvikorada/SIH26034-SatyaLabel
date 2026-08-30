const fs = require('fs');
let js = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

js = js.replace(/manifest:\s*['"`]\/manifest\.json['"`],/g, '');

const headInjection = `      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
      </head>
      <body className={\`\${outfit.variable} antialiased text-text-primary\`}>`;

js = js.replace(/<body className=\{`\$\{outfit\.variable\} antialiased text-text-primary`\}>/, headInjection);

fs.writeFileSync('frontend/app/layout.jsx', js);
console.log("Injected crossOrigin manifest");
