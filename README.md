# HoYoLab Check-In Automation

This project automates the daily check-in process for HoYoLab accounts.

## Getting Started

### 1. Log in to Your HoYoLab Account

1. Visit the [HoYoLab website](https://www.hoyolab.com) and log in with your account.

### 2. Extract Cookies

1. Open the Developer Tools in your browser (usually `F12` or `Ctrl+Shift+I`).
2. Select the "Network" tab.
3. Refresh the page (`F5` or `Ctrl+R`).
4. In the "Filter" box, type `home` to find the `home` request.
5. Click on the `home` request, and under the "Headers" tab, copy the "Cookie" value.

### 3. Set Up the `.env` File

1. Create a `.env` file in the root directory of the project.
2. Set the cookie values as environment variables like this:

```env
GENSHIN_COOKIE="your_copied_cookie_value"
STARRAIL_COOKIE="your_copied_cookie_value"
ZZZ_COOKIE="your_copied_cookie_value"
```

### 4. Run the Script

1. Navigate to the project directory in your terminal.
2. Run the following command to execute the script:

```bash
npm run start
```

## 주의사항

- 쿠키 값은 개인 정보이므로 공유하지 마세요.
- 쿠키 값은 주기적으로 갱신될 수 있으므로, 체크인이 실패할 경우 다시 추출하여 `.env` 파일을 업데이트하세요.
