const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const sgMail = require('@sendgrid/mail');

console.log('Current directory:', __dirname);
console.log('Looking for .env at:', path.resolve(__dirname, '.env'));

// Check all environment variables
console.log('\nAll environment variables starting with SENDGRID:');
Object.keys(process.env).forEach(key => {
  if (key.toUpperCase().includes('SENDGRID')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

const apiKey = process.env.SENDGRID_API_KEY;
console.log('\nAPI Key Check:');
console.log('API Key exists:', !!apiKey);
console.log('API Key value:', apiKey ? 'Set (not showing for security)' : 'NOT SET');
console.log('API Key length:', apiKey?.length);
console.log('API Key starts with SG.:', apiKey?.startsWith('SG.'));

if (!apiKey) {
  console.error('\n❌ SENDGRID_API_KEY is not set in environment variables');
  console.error('Check your .env file or Railway environment variables');
  process.exit(1);
}

if (!apiKey.startsWith('SG.')) {
  console.error('\n❌ API key is invalid format. Should start with "SG."');
  console.error('First 10 chars:', apiKey.substring(0, 10));
  console.error('Get a new API key from SendGrid dashboard');
  process.exit(1);
}

sgMail.setApiKey(apiKey);
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

const msg = {
  to: 'email', // Change to your recipient
  from: 'email', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })