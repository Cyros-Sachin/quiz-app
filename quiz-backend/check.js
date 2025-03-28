const bcrypt = require('bcryptjs');

// Hash the password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    console.log('Hashed Password:', hashedPassword); // Print the hashed password
    return hashedPassword;
  } catch (err) {
    console.error(err);
  }
};

// Compare password with the hashed password
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword); // Compare plain password with hashed password
    if (isMatch) {
      console.log('Password matched');
      return true;
    } else {
      console.log('Password does not match');
      return false;
    }
  } catch (err) {
    console.error(err);
  }
};

// Example usage:
const password = 'sachin123';

// Hash password
hashPassword(password).then((hashedPassword) => {
  // After hashing, compare the entered password with the hashed one
  comparePassword(password, hashedPassword);
});
