const bcrypt = require('bcrypt');

async function testPasswords() {
  const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  const commonPasswords = [
    'admin123',
    'admin',
    '123456',
    'password',
    'admin@123',
    '12345678',
    'secret'
  ];

  console.log('测试常见密码...');
  
  for (const password of commonPasswords) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (isMatch) {
        console.log(`✅ 找到正确密码: ${password}`);
        return password;
      } else {
        console.log(`❌ 密码不匹配: ${password}`);
      }
    } catch (error) {
      console.log(`错误测试密码 ${password}:`, error.message);
    }
  }
  
  console.log('未找到匹配的密码');
  return null;
}

testPasswords();