# Checklist Tính Năng Dự Án MyTask

## 1. Quản Lý Công Việc Nâng Cao (Core Tasks)
- [x] **Kanban Board View**: Giao diện quản lý trạng thái task (List/Board toggle).
- [x] **Calendar View**: Hiển thị task theo lịch trình thời gian. (Implemented)
- [x] **Recursive Tasks**: Tự động tạo lại task định kỳ (Sử dụng APScheduler). (Fully Implemented)
- [x] **Task Dependencies**: Thiết lập sự phụ thuộc giữa các công việc (Logic & Graph). (Implemented)

## 2. Tự Động Hóa & Tích Hợp (Automation & Integration)
- [x] **External XML-RPC API**: Mở rộng cổng kết nối cho các script bên ngoài tại `/rpc`.
- [x] **Webhook Notifications**: Thông báo qua Discord/Slack. (Fully Implemented)
- [x] **Auto-prioritization**: Thuật toán tự động sắp xếp độ ưu tiên dựa trên deadline & priority. (Implemented)

## 3. Giao Diện & Trải Nghiệm (UX/UI)
- [x] **Core UI Kit**: Installed and configured Shadcn UI components: `tooltip`, `popover`, `dialog`, `dropdown-menu`, `form`, `table`, and `label`.
- [x] **Dark Mode**: Hỗ trợ giao diện tối. (Implemented)
- [x] **Real-time Updates**: Cập nhật trạng thái tức thì qua WebSockets (Create/Delete/Status/Complete).
- [x] **Command Palette (Ctrl+K)**: Bộ phím tắt điều hướng nhanh.
- [x] **Keyboard-Only Navigation (Vim-like)**: Điều hướng toàn bộ app bằng phím `h,j,k,l` & shortcuts. (Implemented)

## 4. Phân Tích & Báo Cáo (Analytics)
- [x] **Time Tracking**: Theo dõi thời gian thực hiện từng task (Start/Stop timers).
- [x] **Import/Export**: Xuất/Nhập dữ liệu JSON.
- [x] **Activity Log**: Nhật ký thay đổi chi tiết và System Audit Log.
- [x] **ASCII Productivity Charts**: Biểu đồ hiệu suất vẽ bằng ký tự ASCII (Live Data). (Implemented)

## 5. Hệ Thống & Bảo Mật (System)
- [x] **Health Check Dashboard**: Giám sát trạng thái các job trong APScheduler.
- [x] **API Rate Limiting**: Giới hạn tần suất request (10/min for create, 5/min for run).

## 6. Ý Tưởng Tính Năng Mới (Future Ideas)
- [x] **AI Task Decomposition**: Tự động phân rã task lớn thành sub-tasks bằng thuật toán thông minh. (Implemented)
- [x] **Odoo Remote Shell**: Thực thi script XML-RPC nhanh từ Command Palette. (Implemented)
- [x] **TUI Pomodoro Timer**: Đồng hồ tập trung phong cách terminal với progress bar. (Implemented)
- [x] **Task-to-Code Sync**: Tự động tạo git branch từ Task ID (`feature/task-ID`). (Implemented)

---
*Ghi chú: Đã hoàn thành 100% các tính năng mục tiêu.*
