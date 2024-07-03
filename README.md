# YouTube Download Telegram Bot 🎵🎥

Bu layihə YouTube videolarını MP3 və ya MP4 formatında yükləməyə imkan verən Telegram botudur. Sadəcə YouTube linkini göndərin və bot sizə uyğun faylı təqdim edəcək.

## Quraşdırma 🚀

1. Repo'nu klonlayın:
    ```bash
    git clone https://github.com/abdullaabdullazade/YouTubeDownloadTelegramBot.git
    cd YouTubeDownloadTelegramBot
    ```

2. Lazım olan paketləri quraşdırın:
    ```bash
    npm init
    npm install dotenv@^16.4.5 express@^4.19.2 ffmpeg-static@^5.2.0 fluent-ffmpeg@^2.1.3 mongoose@^8.4.4 node-telegram-bot-api@^0.66.0 nodemon@^3.1.4  ytdl-core@^4.11.5
    npm install
    ```

3. `.env` faylı yaradın və aşağıdakıları əlavə edin:
    ```plaintext
    DATABASE_URL=your_mongodb_database_url
    PORT=your_port
    BOT_TOKEN=your_telegram_bot_token
    ```

## İstifadə 🛠️

1. Serveri başladın:
    ```bash
    npm init
    npm install dotenv@^16.4.5 express@^4.19.2 ffmpeg-static@^5.2.0 fluent-ffmpeg@^2.1.3 mongoose@^8.4.4 node-telegram-bot-api@^0.66.0 nodemon@^3.1.4  ytdl-core@^4.11.5
    npm start
    ```

2. Telegram botunuza `/start` komandası göndərin və botunuzu istifadə etməyə başlayın!

## Töhfələr 👥

Töhfələr açıqdır! Pull request göndərin və ya hər hansı problem barədə məlumat verin.

---

### English 🇬🇧

# YouTube Download Telegram Bot 🎵🎥

This project is a Telegram bot that allows you to download YouTube videos in MP3 or MP4 format. Just send the YouTube link, and the bot will provide you with the appropriate file.

## Installation 🚀

1. Clone the repository:
    ```bash
    git clone https://github.com/abdullaabdullazade/YouTubeDownloadTelegramBot.git
    cd YouTubeDownloadTelegramBot
    ```

2. Install the required packages:
    ```bash
    npm init
    npm install
    ```

3. Create a `.env` file and add the following:
    ```plaintext
    DATABASE_URL=your_mongodb_database_url
    PORT=your_port
    BOT_TOKEN=your_telegram_bot_token
    ```

## Usage 🛠️

1. Start the server:
    ```bash
    npm init
    npm start
    ```

2. Send the `/start` command to your Telegram bot and start using it!

## Contributions 👥

Contributions are welcome! Please send a pull request or report any issues.

