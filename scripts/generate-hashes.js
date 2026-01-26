const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// Generate hashes for test users
generatePasswordHash('admin123');
generatePasswordHash('owner123');  
generatePasswordHash('customer123');