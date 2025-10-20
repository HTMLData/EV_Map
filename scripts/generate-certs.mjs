#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('正在生成自签名 SSL 证书...');

// 创建证书目录
const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// 检查证书是否已存在
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('证书已存在，是否重新生成？(y/N)');
  
  // 在 Node.js 中读取用户输入
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      generateCertificates();
    } else {
      console.log('使用现有证书');
    }
    rl.close();
  });
} else {
  generateCertificates();
}

function generateCertificates() {
  try {
    console.log('生成私钥...');
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

    console.log('生成证书签名请求...');
    execSync(`openssl req -new -key "${keyPath}" -out "${path.join(certsDir, 'localhost.csr')}" -subj "/C=CN/ST=Beijing/L=Beijing/O=Volkswagen/OU=IT/CN=localhost"`, { stdio: 'inherit' });

    console.log('生成自签名证书...');
    execSync(`openssl x509 -req -in "${path.join(certsDir, 'localhost.csr')}" -signkey "${keyPath}" -out "${certPath}" -days 365`, { stdio: 'inherit' });

    // 清理临时文件
    const csrPath = path.join(certsDir, 'localhost.csr');
    if (fs.existsSync(csrPath)) {
      fs.unlinkSync(csrPath);
    }

    console.log('✅ SSL 证书生成完成！');
    console.log('📁 证书位置:');
    console.log(`   - 证书文件: ${certPath}`);
    console.log(`   - 私钥文件: ${keyPath}`);
    console.log('');
    console.log('🚀 现在可以启动 HTTPS 开发服务器:');
    console.log('   npm run dev:https');
    console.log('');
    console.log('⚠️  注意: 浏览器会显示安全警告，请点击 \'高级\' -> \'继续访问\'');

  } catch (error) {
    console.error('❌ 证书生成失败:', error.message);
    console.log('');
    console.log('💡 可能的解决方案:');
    console.log('1. 确保已安装 OpenSSL');
    console.log('   Windows: choco install openssl');
    console.log('   macOS: brew install openssl');
    console.log('   Linux: sudo apt-get install openssl');
    console.log('');
    console.log('2. 手动生成证书:');
    console.log('   Windows: generate-certs.bat');
    console.log('   macOS/Linux: ./generate-certs.sh');
    process.exit(1);
  }
}
