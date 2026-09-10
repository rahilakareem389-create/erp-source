const { User } = require('./models');

(async () => {
  try {
    const user = await User.findOne({ where: { email: undefined } });
    console.log('User:', user ? user.id : 'null');
  } catch (e) {
    console.log('Error caught:', e.message);
  }
  process.exit(0);
})();
