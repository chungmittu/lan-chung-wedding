# Thiệp cưới Lan & Chung

Website thiệp cưới online, thiết kế responsive cho ngày 12.12.2026. Trang sử dụng HTML, CSS và JavaScript thuần; RSVP và lời chúc được lưu qua Google Apps Script vào Google Sheets.

## Chạy thử

Mở terminal tại thư mục này và chạy:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`. Dùng một máy chủ HTTP thay vì mở `index.html` trực tiếp để các tính năng của trình duyệt hoạt động đúng.

Để thử trên điện thoại cùng Wi-Fi, khởi động máy chủ với `--bind 0.0.0.0`, lấy địa chỉ IP của máy tính rồi truy cập `http://<IP-máy-tính>:8000`.

## Tính năng hiện tại

- Trang thiệp, câu chuyện, album ảnh/lightbox, địa điểm, lịch sự kiện và chia sẻ.
- RSVP: gửi phản hồi, kiểm tra bản ghi trong Google Sheets và hiển thị mã xác nhận.
- Lời chúc: gửi vào Google Sheets ở trạng thái `Pending`; lời chúc mới hiện riêng trong phiên người gửi và chỉ được công khai sau khi duyệt.
- Mừng cưới: hiển thị mã QR VietQR, thông tin tài khoản và nút sao chép.
- Nhạc nền “Hơn Cả Yêu” – Đức Phúc: bắt đầu khi khách bấm mở thiệp; trình duyệt có thể giới hạn tự phát.
- Giao diện responsive, ảnh hero riêng cho điện thoại và hỗ trợ safe area.

## Cấu hình và triển khai

1. Làm theo [GOOGLE-SHEETS-SETUP.md](./GOOGLE-SHEETS-SETUP.md) để tạo Sheet và triển khai Apps Script.
2. Cập nhật `apiUrl` trong `config.js` thành URL Web App `/exec` đang hoạt động.
3. Thay `siteUrl` trong `config.js` và domain `https://ten-website.netlify.app/` trong các thẻ `canonical`, `og:url`, `og:image` và `twitter:image` ở `index.html` bằng URL HTTPS thật của website. Các thẻ này giúp Zalo/Facebook hiển thị tiêu đề, mô tả và ảnh khi gửi link; trình thu thập dữ liệu của mạng xã hội đọc HTML trực tiếp nên không dùng giá trị được chèn bằng JavaScript.
4. Đưa toàn bộ nội dung thư mục này lên dịch vụ hosting tĩnh. Giữ nguyên cấu trúc và đường dẫn tương đối của các file.
5. Hoàn tất các bài kiểm tra trong [BACKEND-CONFIG-CHECKLIST.md](./BACKEND-CONFIG-CHECKLIST.md) sau khi triển khai.

## Các mục chưa hoàn thiện

- Nội dung câu chuyện, mốc thời gian và một số ảnh hiện vẫn là nội dung mẫu; cần thay bằng nội dung chính thức trước khi công bố.
- Các URL xem trước hiện dùng domain giữ chỗ; cần cập nhật domain thật và triển khai website qua HTTPS trước khi chia sẻ. Nếu Zalo/Facebook vẫn lưu preview cũ, hãy yêu cầu nền tảng quét lại URL sau khi cập nhật.

Xem [SETUP.md](./SETUP.md) để biết quy trình triển khai và [MOBILE-AUDIT.md](./MOBILE-AUDIT.md) để biết các kích thước cần kiểm tra.
