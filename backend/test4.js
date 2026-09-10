const { User } = require('./models');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const user = await User.findOne({ where: { email: 'admin@lancerstech.com' } });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('User found:', user.id);
    
    const supplied = 'admin123';
    const passwordMatches = await user.comparePassword(supplied);
    console.log('Matches?', passwordMatches);

    const rounds = bcrypt.getRounds(user.passwordHash);
    console.log('Rounds:', rounds);
  } catch (e) {
    console.log('Error caught:', e.message);
    console.log(e.stack);
  }
  process.exit(0);
})();
