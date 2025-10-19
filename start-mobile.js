#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

// 检查端口是否被占用
function checkPort(port) {
  try {
    execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
    return true; // 端口被占用
  } catch {
    return false; // 端口空闲
  }
}

// 获取本机IP
const localIP = getLocalIP();

console.log('🚀 启动大众充电桩查找应用（移动端优化版）...');
console.log('');
console.log('📱 移动端访问地址:');
console.log(`   http://${localIP}:3000`);
console.log('');
console.log('💻 桌面端访问地址:');
console.log('   http://localhost:3000');
console.log('');

// 检查端口状态
if (checkPort(3000)) {
  console.log('⚠️  警告: 端口3000已被占用');
  console.log('   请先停止其他服务或使用不同端口');
  console.log('');
}

console.log('📋 移动端访问步骤:');
console.log('1. 确保手机和电脑连接在同一个WiFi网络');
console.log('2. 在手机浏览器中输入上述移动端访问地址');
console.log('3. 如果超时，请尝试以下解决方案:');
console.log('');
console.log('🔧 超时问题解决方案:');
console.log('- 清除手机浏览器缓存');
console.log('- 尝试使用Chrome或Safari浏览器');
console.log('- 检查WiFi网络是否稳定');
console.log('- 关闭手机的VPN或代理');
console.log('- 重启WiFi连接');
console.log('');
console.log('🛠️  如果仍然无法访问:');
console.log('- 检查电脑防火墙设置');
console.log('- 确认3000端口未被阻止');
console.log('- 尝试关闭杀毒软件');
console.log('');

// 启动开发服务器
try {
  console.log('🔄 正在启动开发服务器...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 启动失败:', error.message);
  console.log('');
  console.log('💡 尝试手动启动:');
  console.log('npm run dev');
  process.exit(1);
}