const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_education';
console.log('\nMongo URI (masked):', uri.length > 60 ? uri.substring(0,30) + '...' + uri.substring(uri.length-20) : uri);

const tests = [
  { name: 'Default options', opts: {} },
  { name: 'tls=true', opts: { tls: true } },
  { name: 'tlsAllowInvalidCertificates', opts: { tls: true, tlsAllowInvalidCertificates: true } },
  { name: 'tlsAllowInvalidHostnames', opts: { tls: true, tlsAllowInvalidHostnames: true } },
  { name: 'family IPv4', opts: { family: 4 } },
  { name: 'rejectUnauthorized=false (env)', opts: {}, env: { NODE_TLS_REJECT_UNAUTHORIZED: '0' } },
  { name: 'legacy provider (env)', opts: {}, env: { NODE_OPTIONS: '--openssl-legacy-provider' } }
];

(async () => {
  for (const t of tests) {
    console.log('\n==== Test:', t.name, '====');
    const originalEnv = { ...process.env };
    if (t.env) Object.assign(process.env, t.env);
    try {
      const opts = Object.assign({ serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 }, t.opts);
      console.log('Trying with options:', opts, t.env ? ('env=' + JSON.stringify(t.env)) : '');
      await mongoose.connect(uri, opts);
      console.log('✅ Connected successfully with', t.name);
      await mongoose.connection.close();
    } catch (err) {
      console.error('❌ Failed:', err && err.message ? err.message : err);
      if (err && err.stack) console.error(err.stack.split('\n').slice(0,6).join('\n'));
    } finally {
      process.env = originalEnv;
    }
  }
  process.exit(0);
})();
