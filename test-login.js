const testLogin = async () => {
  try {
    const r = await fetch('http://localhost:5173/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'admin@salambumi.xyz', password: 'salam2026' })
    });
    const d = await r.json();
    console.log('Login status:', r.status, 'success:', d.success, 'error:', d.error);
    if (d.token) console.log('Token received (len:', d.token.length, ')');
  } catch(e) {
    console.error('ERR', e.message);
  }
};
testLogin();
