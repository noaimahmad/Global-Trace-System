async function check() {
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('Root status:', res.status);
    const text = await res.text();
    console.log('Root content length:', text.length);
  } catch (err) {
    console.error('Root check failed:', err.message);
  }
}
check();
