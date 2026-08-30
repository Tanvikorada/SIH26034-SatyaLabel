
async function register(email, name, role) {
  const res = await fetch("https://satyalabel-backend.onrender.com/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password: "password", role })
  });
  console.log(await res.text());
}
register("admin@gov.in", "Admin User", "admin");
register("officer@gov.in", "Field Officer", "officer");

