require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('=== MongoDB Connection Test ===');
console.log('URI:', uri.replace(/\/\/.*@/, '//<credentials>@')); // hide password
console.log('Attempting to connect...\n');

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState);

    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   Collections:', collections.length ? collections.map(c => c.name).join(', ') : '(none yet)');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected. Test complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ FAILED: Could not connect to MongoDB.');
    console.log('   Error:', err.message);
    console.log('\n   Troubleshooting:');
    console.log('   1. Check that your Atlas cluster is active (not paused).');
    console.log('   2. Whitelist your IP in Atlas → Network Access (or add 0.0.0.0/0).');
    console.log('   3. Verify username/password in the .env file.');
    console.log('   4. Check your internet connection.');
    process.exit(1);
  });
