fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@erp.com', password: 'admin123' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
