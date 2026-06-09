const testLead = async () => {
  try {
    const r = await fetch('http://localhost:5173/api/leads', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        name: 'Test User',
        whatsapp: '081234567890', // NOW INCLUDED
        origin: 'Jakarta',
        message: 'Test lead from audit fix'
      })
    });
    const d = await r.json();
    console.log('Status:', r.status, 'success:', d.success, 'error:', d.error);
    if (d.success) console.log('✅ Lead created with ID:', d.id);
  } catch(e) {
    console.error('ERR', e.message);
  }
};
testLead();
