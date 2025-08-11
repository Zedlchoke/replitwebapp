#!/bin/bash

echo "🚀 Deploying to Render..."

# Kiểm tra git status
if [[ $(git status --porcelain) ]]; then
    echo "❌ Có thay đổi chưa commit. Hãy commit trước khi deploy."
    exit 1
fi

# Push code lên GitHub
echo "📤 Pushing code to GitHub..."
git push origin main

echo "✅ Code đã được push lên GitHub"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Đăng nhập vào Render Dashboard: https://dashboard.render.com"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect GitHub repository này"
echo "4. Render sẽ tự động detect render.yaml và deploy"
echo ""
echo "📖 Xem hướng dẫn chi tiết trong file DEPLOYMENT_GUIDE.md"
echo ""
echo "🌐 Sau khi deploy xong, app sẽ có URL: https://webapp.onrender.com"
