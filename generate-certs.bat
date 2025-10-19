@echo off
chcp 65001 >nul
REM Windows 批处理脚本 - 生成 SSL 证书
REM 用于 Windows 系统生成自签名证书

echo 🔐 正在生成自签名 SSL 证书...

REM 检查证书目录是否存在
if not exist "certs" mkdir certs

REM 检查是否已存在证书
if exist "certs\localhost.pem" if exist "certs\localhost-key.pem" (
    echo ⚠️  证书已存在，是否重新生成？(Y/N)
    set /p response=
    if /i not "%response%"=="Y" (
        echo ✅ 使用现有证书
        goto :end
    )
)

REM 检查 OpenSSL 是否可用
openssl version >nul 2>&1
if errorlevel 1 (
    echo ❌ OpenSSL 未安装或不在 PATH 中
    echo.
    echo 💡 请安装 OpenSSL:
    echo    方法1: choco install openssl
    echo    方法2: 下载 Git for Windows (包含 OpenSSL)
    echo    方法3: 从 https://slproweb.com/products/Win32OpenSSL.html 下载
    echo.
    pause
    exit /b 1
)

echo 📝 生成私钥...
openssl genrsa -out certs\localhost-key.pem 2048
if errorlevel 1 (
    echo ❌ 私钥生成失败
    pause
    exit /b 1
)

echo 📝 生成证书签名请求...
openssl req -new -key certs\localhost-key.pem -out certs\localhost.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Volkswagen/OU=IT/CN=localhost"
if errorlevel 1 (
    echo ❌ 证书签名请求生成失败
    pause
    exit /b 1
)

echo 📝 生成自签名证书...
openssl x509 -req -in certs\localhost.csr -signkey certs\localhost-key.pem -out certs\localhost.pem -days 365
if errorlevel 1 (
    echo ❌ 自签名证书生成失败
    pause
    exit /b 1
)

REM 清理临时文件
if exist certs\localhost.csr del certs\localhost.csr

echo ✅ SSL 证书生成完成！
echo 📁 证书位置:
echo    - 证书文件: certs\localhost.pem
echo    - 私钥文件: certs\localhost-key.pem
echo.
echo 🚀 现在可以启动 HTTPS 开发服务器:
echo    npm run dev:https
echo.
echo ⚠️  注意: 浏览器会显示安全警告，请点击 '高级' -^> '继续访问'

:end
echo.
echo 按任意键退出...
pause >nul
