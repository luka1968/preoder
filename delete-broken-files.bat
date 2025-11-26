@echo off
echo 正在删除损坏的webhook文件...

del /F "pages\api\webhooks\app\uninstalled.ts"
del /F "pages\api\webhooks\privacy\customers-data-request.ts"
del /F "pages\api\webhooks\privacy\customers-redact.ts"
del /F "pages\api\webhooks\privacy\shop-redact.ts"

echo.
echo ✅ 删除完成！
echo.
echo 现在执行：
echo   git add -A
echo   git commit -m "fix: 删除损坏的webhook文件"
echo   git push origin main --force
echo.
pause
