# Thiết lập và triển khai

## 1. Chuẩn bị Google Sheets

1. Tạo Google Sheet mới.
2. Mở **Extensions > Apps Script** và dán nội dung từ `google-apps-script/Code.gs`.
3. Trong cài đặt dự án Apps Script, chọn múi giờ `Asia/Ho_Chi_Minh`.
4. Chạy `setupWeddingSheets` một lần và cấp quyền. Hai sheet `RSVP` và `Wishes` sẽ được tạo với tiêu đề cột do mã nguồn quy định.
5. Triển khai Apps Script thành **Web app**: chọn **Execute as: Me** và thiết lập quyền truy cập phù hợp để khách mời có thể gửi phản hồi. Sao chép URL kết thúc bằng `/exec`.

Chi tiết triển khai, trạng thái lời chúc và quy trình xác minh được mô tả trong [GOOGLE-SHEETS-SETUP.md](./GOOGLE-SHEETS-SETUP.md).

## 2. Cấu hình website

Trong `config.js`, đặt `apiUrl` thành URL `/exec` vừa triển khai. Có thể thay `siteUrl` bằng URL website thật; hiện tại mã JavaScript không sử dụng thuộc tính này.

Không đổi tên sheet hoặc thứ tự cột do `Code.gs` sử dụng. Nếu sửa Apps Script, hãy tạo phiên bản triển khai mới trong **Deploy > Manage deployments > Edit > New version**.

## 3. Chạy thử và triển khai website

- Chạy máy chủ HTTP cục bộ từ thư mục chứa `index.html` (ví dụ `python -m http.server 8000`) và mở `http://localhost:8000`.
- Triển khai toàn bộ thư mục lên hosting tĩnh. Giữ nguyên các thư mục `assets/` và `google-apps-script/`.
- Dùng website HTTPS đã triển khai để kiểm tra RSVP và lời chúc thực tế; kiểm tra cục bộ không thay thế bước này.

## 4. Kiểm tra sau triển khai

- Phần RSVP báo Google Sheets đã kết nối.
- Gửi RSVP thử; xác nhận có dòng mới trong sheet `RSVP` và trang hiển thị mã xác nhận.
- Gửi lời chúc; xác nhận có dòng `Pending` trong `Wishes`. Lời chúc vừa gửi chỉ hiển thị trong phiên người gửi; sau khi tải lại, chỉ lời chúc `Approved` được tải lên.
- Đổi trạng thái lời chúc thử thành `Approved`, tải lại website và xác nhận nó xuất hiện.

Kiểm tra hai QR, thao tác sao chép thông tin tài khoản và nút nhạc trên website HTTPS. Tự phát nhạc phụ thuộc vào chính sách của trình duyệt và quyền nhúng video YouTube.
