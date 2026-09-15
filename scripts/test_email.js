const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

async function testEmail() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const cleanPass = rawPass.replace(/\s+/g, '').trim();

  console.log('--- TESTING SMTP SETUP ---');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('User:', user);
  console.log('Raw Pass:', JSON.stringify(rawPass));
  console.log('Clean Pass:', JSON.stringify(cleanPass));

  // 1. Test raw password
  console.log('\n--> Attempt 1: Testing with raw password (with spaces)...');
  try {
    const t1 = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: rawPass },
      tls: { rejectUnauthorized: false }
    });
    await t1.verify();
    console.log('✅ Attempt 1 (Raw Pass) SUCCESSFUL!');
  } catch (err) {
    console.error('❌ Attempt 1 (Raw Pass) FAILED:', err.message);
  }

  // 2. Test cleaned password
  console.log('\n--> Attempt 2: Testing with cleaned password (spaces stripped)...');
  try {
    const t2 = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: cleanPass },
      tls: { rejectUnauthorized: false }
    });
    await t2.verify();
    console.log('✅ Attempt 2 (Clean Pass) SUCCESSFUL!');
  } catch (err) {
    console.error('❌ Attempt 2 (Clean Pass) FAILED:', err.message);
  }
}

testEmail();
