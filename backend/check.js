
const jwt = require("jsonwebtoken");
async function check() {
  const res = await fetch("https://satyalabel-backend.onrender.com/api/v1/scans?limit=1", {
    headers: {
      "Authorization": "Bearer " + jwt.sign({id: "admin", email: "admin@gov.in", role: "admin"}, "satyalabel_sih26034_secret_change_this_in_production", {expiresIn: "1h"})
    }
  });
  console.log(await res.text());
}
check();

