const bcrypt = require('bcryptjs');
(async () => {
  try {
    const match = await bcrypt.compare('admin123', 'admin123');
    console.log('Match:', match);
  } catch (e) {
    console.log('Compare Error:', e.message);
  }
})();
