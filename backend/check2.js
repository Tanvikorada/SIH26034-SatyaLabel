
const jwt = require("jsonwebtoken");
async function check() {
  const res = await fetch("https://satyalabel-backend.onrender.com/api/v1/scans/53c7038e-a1c0-4395-8ffe-c5e86c0ea0c9", {
    headers: {
      "Authorization": "Bearer " + jwt.sign({id: "admin", email: "admin@gov.in", role: "admin"}, "satyalabel_sih26034_secret_change_this_in_production", {expiresIn: "1h"})
    }
  });
  console.log(await res.text());
}
check();

