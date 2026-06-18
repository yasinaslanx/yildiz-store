const fetch = require('node-fetch');

async function testBulkUpdate() {
  const res = await fetch("http://localhost:3000/api/admin/products/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "increase", percentage: 1 })
  });
  const json = await res.json();
  console.log(json);
}

testBulkUpdate();
