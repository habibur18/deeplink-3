// Import the 'crypto' module
const crypto = require("crypto");

// Generate a 16-byte (128-bit) random string and convert it to hex (32 characters)
const secret = crypto.randomBytes(16).toString("hex");

// Log the secret to the console
console.log(secret);
