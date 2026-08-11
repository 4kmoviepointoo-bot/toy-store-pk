// Run this script to generate a bcrypt hash for your admin password:
// npx tsx scripts/generate-admin-hash.ts

import bcrypt from "bcryptjs";

const password = process.argv[2] || "admin123";

async function main() {
  const hash = await bcrypt.hash(password, 12);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log(`\nAdd to .env.local:`);
  console.log(`ADMIN_USERNAME=admin`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`ADMIN_SESSION_SECRET=<random-secret-string>`);
}

main();
