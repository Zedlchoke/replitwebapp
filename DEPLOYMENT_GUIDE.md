# Hướng Dẫn Deploy Lên Render

## Bước 1: Chuẩn Bị

1. **Đảm bảo code đã được commit và push lên GitHub**
2. **Có tài khoản Render** (https://render.com)

## Bước 2: Deploy Tự Động với render.yaml

### Cách 1: Deploy trực tiếp từ GitHub
1. Đăng nhập vào Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect GitHub repository
4. Chọn repository này
5. Render sẽ tự động detect file `render.yaml` và tạo:
   - Web service
   - PostgreSQL database
   - Environment variables

### Cách 2: Deploy thủ công
1. Tạo PostgreSQL database trước:
   - New + → PostgreSQL
   - Name: `webapp-db`
   - Database: `webapp`
   - User: `webapp`
   - Plan: Starter ($7/month)

2. Tạo Web Service:
   - New + → Web Service
   - Connect GitHub repository
   - Name: `webapp`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Plan: Starter ($7/month)

## Bước 3: Cấu Hình Environment Variables

Trong Web Service, thêm các environment variables:

### Tự động từ Database:
- `DATABASE_URL`: Render sẽ tự động lấy từ database

### Cần cấu hình thủ công:
- `GOOGLE_CLOUD_PROJECT`: ID project Google Cloud
- `GOOGLE_CLOUD_STORAGE_BUCKET`: Tên bucket Google Cloud Storage
- `GOOGLE_APPLICATION_CREDENTIALS`: JSON credentials file
- `NODE_ENV`: `production`
- `PORT`: `5000`

## Bước 4: Cấu Hình Google Cloud Storage

1. **Tạo Service Account:**
   ```bash
   gcloud iam service-accounts create webapp-service \
     --display-name="Web App Service Account"
   ```

2. **Gán quyền Storage Admin:**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:webapp-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   ```

3. **Tạo key file:**
   ```bash
   gcloud iam service-accounts keys create credentials.json \
     --iam-account=webapp-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Upload credentials.json lên Render:**
   - Trong Web Service → Environment
   - Thêm `GOOGLE_APPLICATION_CREDENTIALS` với nội dung file JSON

## Bước 5: Deploy và Test

1. **Deploy:**
   - Render sẽ tự động build và deploy
   - Có thể theo dõi logs trong real-time

2. **Test:**
   - Health check: `https://your-app.onrender.com/api/health`
   - Database connection: `/api/initialize-db`
   - Main app: `https://your-app.onrender.com`

## Bước 6: Cấu Hình Domain (Tùy chọn)

1. Trong Web Service → Settings → Custom Domains
2. Thêm domain của bạn
3. Cấu hình DNS records

## Troubleshooting

### Lỗi Database Connection
- Kiểm tra `DATABASE_URL` format
- Đảm bảo database đã được tạo
- Kiểm tra SSL configuration

### Lỗi Build
- Kiểm tra `package.json` scripts
- Đảm bảo tất cả dependencies đã được install
- Kiểm tra TypeScript compilation

### Lỗi Google Cloud Storage
- Kiểm tra credentials file
- Đảm bảo service account có đủ quyền
- Kiểm tra bucket name và project ID

## Chi Phí

- **Starter Plan**: $7/month cho mỗi service
- **Database**: $7/month
- **Web Service**: $7/month
- **Tổng**: ~$14/month

## Monitoring

- **Logs**: Real-time logs trong Render Dashboard
- **Metrics**: CPU, Memory usage
- **Health Checks**: Tự động kiểm tra `/api/health`
- **Auto-scaling**: Tự động scale dựa trên traffic
