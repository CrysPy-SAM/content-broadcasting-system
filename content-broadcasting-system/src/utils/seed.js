const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedUsers = async () => {
  const client = await pool.connect();

  try {
    const saltRounds = 10;

    // Create Principal
    const principalHash = await bcrypt.hash('principal123', saltRounds);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Principal Admin', 'principal@school.com', principalHash, 'principal']);

    // Create Teachers
    const teacher1Hash = await bcrypt.hash('teacher123', saltRounds);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Teacher One', 'teacher1@school.com', teacher1Hash, 'teacher']);

    const teacher2Hash = await bcrypt.hash('teacher123', saltRounds);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Teacher Two', 'teacher2@school.com', teacher2Hash, 'teacher']);

    console.log('✅ Seed data created successfully');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('  Principal: principal@school.com / principal123');
    console.log('  Teacher 1: teacher1@school.com / teacher123');
    console.log('  Teacher 2: teacher2@school.com / teacher123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

seedUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
