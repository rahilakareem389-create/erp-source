const bcrypt = require('bcryptjs');
try {
  bcrypt.getRounds('admin123');
} catch (e) {
  console.log('Error:', e.message);
}
