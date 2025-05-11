const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('hex');
// Print the generated JWT secret to console
console.log('JWT Secret:', jwtSecret);
 
