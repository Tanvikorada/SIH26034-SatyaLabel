const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

// Fix frame 2
code = code.replace(/&nbsp;&nbsp;"mrp": "Rs\. 250",<br\/>/g, "&nbsp;&nbsp;{'\"mrp\": \"Rs. 250\",'}<br/>");
code = code.replace(/&nbsp;&nbsp;"net_qty": "100g",<br\/>/g, "&nbsp;&nbsp;{'\"net_qty\": \"100g\",'}<br/>");
code = code.replace(/&nbsp;&nbsp;"mfg_date": "08\/2025"<br\/>/g, "&nbsp;&nbsp;{'\"mfg_date\": \"08/2025\"'}<br/>");

// Fix done state
code = code.replace(/<div className="text-\[#79c0ff\]">"extracted_data": \{"\{"\}<\/div>/g, '<div className="text-[#79c0ff]">{"\\"extracted_data\\": {"}</div>');
code = code.replace(/<div className="pl-4"><span className="text-\[#a5d6ff\]">"mrp"<\/span>: <span className="text-\[#a5d6ff\]">"Rs 50"<\/span>,<\/div>/g, '<div className="pl-4"><span className="text-[#a5d6ff]">{"\\"mrp\\""}</span>: <span className="text-[#a5d6ff]">{"\\"Rs 50\\""}</span>,</div>');
code = code.replace(/<div className="pl-4"><span className="text-\[#a5d6ff\]">"qty"<\/span>: <span className="text-\[#a5d6ff\]">"100g"<\/span><\/div>/g, '<div className="pl-4"><span className="text-[#a5d6ff]">{"\\"qty\\""}</span>: <span className="text-[#a5d6ff]">{"\\"100g\\""}</span></div>');

fs.writeFileSync('frontend/app/page.jsx', code);
console.log("QUOTES FIXED");
