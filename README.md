# Auto Browser - Công cụ tự động hóa trình duyệt

<p align="center">
  <img src="https://raw.githubusercontent.com/puppeteer/puppeteer/main/website/static/img/puppeteer-logo.png" width="200" alt="Puppeteer Logo" />
</p>

## Giới thiệu

Auto Browser là một API dựa trên NestJS giúp tự động hóa các thao tác trên trình duyệt web thông qua Puppeteer. Dự án này cho phép bạn thực hiện các tác vụ tự động như điều hướng trang web, nhập dữ liệu, nhấp chuột, và thực thi JavaScript tùy chỉnh.

## Tính năng

- **Quản lý profile trình duyệt**: Lưu trữ và sử dụng lại các profile trình duyệt
- **Điều khiển nhiều tab**: Mở và quản lý nhiều tab cùng lúc
- **Các hành động tự động hóa**:
  - Điều hướng đến URL
  - Nhập văn bản vào phần tử
  - Nhấp vào phần tử
  - Di chuột qua phần tử
  - Nhấn phím
  - Đợi phần tử xuất hiện
  - Lấy văn bản từ phần tử
  - Thực thi JavaScript tùy chỉnh
  - Đóng tab
- **API RESTful**: Dễ dàng tích hợp vào các ứng dụng khác
- **Tài liệu Swagger**: API được mô tả đầy đủ với Swagger
- **Bypass Anti-Bot**: Các cơ chế giúp tránh phát hiện bot

## Cài đặt

```bash
# Cài đặt các gói phụ thuộc
$ npm install

# Đảm bảo các dependency của Puppeteer được cài đặt
$ npm run postinstall
```

## Chạy ứng dụng

```bash
# Chế độ phát triển
$ npm run start:dev

# Chế độ sản phẩm
$ npm run start:prod
```

## Sử dụng API

### Khởi tạo profile

```
GET /browser/setting-profile?profileId=your_profile_id
```

### Thực thi các hành động

```bash
POST /browser/execute
```

Nội dung yêu cầu (JSON):

```json
{
  "profileId": "your_profile_id",
  "actions": [
    {
      "type": "goto",
      "params": {
        "url": "https://google.com"
      }
    },
    {
      "type": "type",
      "params": {
        "selector": "input[name='q']",
        "text": "NestJS Puppeteer"
      }
    },
    {
      "type": "press",
      "params": {
        "key": "Enter"
      }
    },
    {
      "type": "waitForSelector",
      "params": {
        "selector": "#search"
      }
    }
  ]
}
```

### Danh sách các kiểu hành động

| Type            | Mô tả                  |
| --------------- | ---------------------- |
| goto            | Điều hướng đến URL     |
| type            | Nhập văn bản           |
| click           | Nhấp vào phần tử       |
| hover           | Di chuột qua phần tử   |
| press           | Nhấn phím              |
| waitForSelector | Đợi phần tử xuất hiện  |
| getText         | Lấy văn bản từ phần tử |
| evaluate        | Thực thi JavaScript    |
| closeTab        | Đóng tab hiện tại      |

## Xem tài liệu API

Sau khi khởi động ứng dụng, truy cập địa chỉ sau để xem tài liệu Swagger:

```
http://localhost:5008/api-docs
```

## Ví dụ sử dụng

### Đăng nhập vào một trang web

```json
{
  "profileId": "user@example.com",
  "actions": [
    {
      "type": "goto",
      "params": { "url": "https://example.com/login" }
    },
    {
      "type": "type",
      "params": { "selector": "input[name='username']", "text": "user@example.com" }
    },
    {
      "type": "type",
      "params": { "selector": "input[name='password']", "text": "securepassword" }
    },
    {
      "type": "click",
      "params": { "selector": "button[type='submit']" }
    },
    {
      "type": "waitForSelector",
      "params": { "selector": ".dashboard", "timeout": 5000 }
    }
  ]
}
```

### Mở nhiều tab và đóng tab

```json
{
  "profileId": "user@example.com",
  "actions": [
    {
      "type": "goto",
      "params": { "url": "https://example.com" }
    },
    {
      "type": "closeTab",
      "params": {}
    }
  ]
}
```

## Yêu cầu hệ thống

- Node.js (>= 16.0.0)
- Chrome hoặc Chromium

## Giấy phép

[MIT Licensed](LICENSE)
