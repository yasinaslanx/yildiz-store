fetch("http://localhost:3000/api/categories").then(r => r.json()).then(d => {
  console.log("Categories:", d.data.map((c: any) => c.slug).join(", "));
}).catch(console.error);
