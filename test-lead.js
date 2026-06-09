const testLead = async () => {
  try {
    const r = await fetch('http://localhost:5173/api/leads', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        name: 'Test User',
        whatsapp: '', // empty!
        origin: 'Jakarta',
        message: 'Test message'
      })
    });
    const d = await r.json();
    console.log('Status:', r.status, 'success:', d.success, 'error:', d.error);
  } catch(e) {
    console.error('ERR', e.message);
  }
};
testLead();
