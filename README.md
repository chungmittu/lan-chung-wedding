# Thiệp cưới Lan & Chung

Website thiệp cưới tĩnh, thiết kế responsive cho ngày 12.12.2026. Trang sử dụng HTML, CSS và JavaScript thuần; RSVP và lời chúc được lưu qua Google Apps Script vào Google Sheets.

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
- Lời chúc: gửi vào Google Sheets; lời chúc mới đang ở trạng thái `Pending`. Lời chúc được duyệt mới được tải lên trang sau khi tải lại.
- Giao diện responsive, ảnh hero riêng cho điện thoại và hỗ trợ safe area.

## Cấu hình và triển khai

1. Làm theo [GOOGLE-SHEETS-SETUP.md](./GOOGLE-SHEETS-SETUP.md) để tạo Sheet và triển khai Apps Script.
2. Cập nhật `apiUrl` trong `config.js` thành URL Web App `/exec` đang hoạt động.
3. Có thể thay `siteUrl` trong `config.js` bằng URL website thật để cấu hình không còn giá trị mẫu; hiện thuộc tính này chưa được `main.js` sử dụng.
4. Đưa toàn bộ nội dung thư mục này lên dịch vụ hosting tĩnh. Giữ nguyên cấu trúc và đường dẫn tương đối của các file.
5. Hoàn tất các bài kiểm tra trong [BACKEND-CONFIG-CHECKLIST.md](./BACKEND-CONFIG-CHECKLIST.md) sau khi triển khai.

## Các mục chưa hoàn thiện

- Hai mã QR và thao tác sao chép thông tin mừng cưới hiện là nội dung giữ chỗ.
- Nút nhạc hiện thông báo rằng nhạc chưa được cấu hình.
- Một số nội dung câu chuyện và ảnh được đánh dấu mẫu trong trang cần được thay bằng nội dung chính thức.
- `siteUrl` trong `config.js` là giá trị giữ chỗ nhưng hiện chưa ảnh hưởng đến chức năng website.

Xem [SETUP.md](./SETUP.md) để biết quy trình triển khai và [MOBILE-AUDIT.md](./MOBILE-AUDIT.md) để biết các kích thước cần kiểm tra.
