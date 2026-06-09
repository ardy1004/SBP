import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Generate a random salt of 16 bytes
  const salt = crypto.randomBytes(16);
  
  // Convert salt to base64 string (standard base64 with padding)
  const saltBase64 = salt.toString('base64');
  
  // Create buffer: salt + 'salam2026'
  const saltPlusString = Buffer.concat([salt, Buffer.from('salam2026', 'utf8')]);
  
  // Compute SHA-256 hash
  const hash = crypto.createHash('sha256').update(saltPlusString).digest('hex');
  
  // Format result: salt$<base64_encoded_salt>$<hex_hash>
  const result = `salt$${saltBase64}$${hash}`;
  
  // Define output file path
  const outputPath = path.join(__dirname, 'temp', 'hash.txt');
  
  // Ensure the directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write result to file
  fs.writeFileSync(outputPath, result, 'utf8');
  
  // Log to console
  console.log('Hash generated successfully:');
  console.log(result);
  console.log(`Written to: ${outputPath}`);
} catch (error) {
  console.error('Error generating hash:', error.message);
  process.exit(1);
}