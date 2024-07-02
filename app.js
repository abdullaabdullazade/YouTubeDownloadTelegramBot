require('dotenv').config();

if (!process.env.NTBA_FIX_350) {
    process.env.NTBA_FIX_350 = 'true';
}

const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const ytdl = require('ytdl-core');
const TelegramBot = require('node-telegram-bot-api');
const ffmpeg = require('fluent-ffmpeg');
const User = require('./users');
const path = require('path');

const database_url = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const token = process.env.BOT_TOKEN;

const app = express();
const queues = {};

mongoose.connect(database_url)
    .then(() => console.log('Database connected successfully.'))
    .catch(err => console.error('Database connection error:', err));

const registerUser = async (userid) => {
    const user = await User.findOne({ id: userid });
    if (user !== null) return;
    await User.create({ id: userid });
};

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
    await registerUser(msg.chat.id);
    const startMessage = `Hello <b>${msg.from.first_name}</b>! Welcome to your YouTube video to MP3 assistant bot. Simply send me the link of the YouTube video you want to convert, and I will provide you with the MP3 file. Enjoy listening to your favorite music! 🎵`;
    bot.sendMessage(msg.chat.id, startMessage, { parse_mode: 'HTML' });
});

bot.on('message', async (msg) => {
    if (msg.text.startsWith('/')) return;

    await registerUser(msg.chat.id);

    if (!msg.entities || msg.entities[0].type !== 'url') {
        const send_Link = 'Please send me only a YouTube link! 📎';
        bot.sendMessage(msg.chat.id, send_Link);
        return;
    }

    const sanitizedLink = encodeURIComponent(msg.text.trim());
    queues[msg.chat.id] = sanitizedLink;

    bot.sendMessage(msg.chat.id, 'Select link type: audio 🎵 or video 🎥', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Audio 🎵', callback_data: `audio` },
                    { text: 'Video 🎥', callback_data: `video` }
                ]
            ]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const videoURL = decodeURIComponent(queues[msg.chat.id]);

    bot.deleteMessage(msg.chat.id, msg.message_id);
    const msgid = (await bot.sendMessage(msg.chat.id, 'Downloading...')).message_id;

    if (data === "audio") {
        await downloadAudio(videoURL, msg);
    } else if (data === "video") {
        await downloadAndSendVideo(videoURL, msg);
    }
    bot.deleteMessage(msg.chat.id, msgid);
    delete queues[msg.chat.id];
});

const downloadAudio = async (videoURL, msg) => {
    try {
        console.log(msg);
        const downloadsDir = path.resolve(__dirname, String(msg.chat.id));
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir);
        }
        const videoInfo = await ytdl.getInfo(videoURL);
        const videoTitle = videoInfo.videoDetails.title.replace(/[<>:"\/\\|?*]+/g, '');
        const audioPath = path.join(downloadsDir, `${videoTitle}.mp3`);

        const stream = ytdl(videoURL, { quality: 'highestaudio' })
            .pipe(fs.createWriteStream(audioPath));

        stream.on('finish', async () => {
            await bot.sendDocument(msg.chat.id, audioPath, {}, {
                filename: `${videoTitle}.mp3`,
                contentType: 'audio/mpeg'
            });
            fs.unlink(audioPath, (err) => {
                if (err) console.error(`Error deleting file: ${err}`);
            });
        });

        stream.on('error', async (err) => {
            await bot.sendMessage(msg.chat.id, 'There is a problem with your link. 🚨');
        });
    } catch (error) {
        await bot.sendMessage(msg.chat.id, 'There is a problem with your link. 🚨');
    }
};

const downloadAndSendVideo = async (videoURL, msg) => {
    const downloadsDir = path.resolve(__dirname, String(msg.chat.id));
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const videoTitle = videoInfo.videoDetails.title.replace(/[<>:"\/\\|?*]+/g, '');
        const videoPath = path.join(downloadsDir, `${videoTitle}.mp4`);
        const audioPath = path.join(downloadsDir, `${videoTitle}.mp3`);
        const outputPath = path.join(downloadsDir, `${videoTitle}_final.mkv`);

        await new Promise((resolve, reject) => {
            const videoStream = ytdl(videoURL, { quality: 'highestvideo' }).pipe(fs.createWriteStream(videoPath));
            videoStream.on('finish', resolve);
            videoStream.on('error', reject);
        });

        await new Promise((resolve, reject) => {
            const audioStream = ytdl(videoURL, { quality: 'highestaudio' }).pipe(fs.createWriteStream(audioPath));
            audioStream.on('finish', resolve);
            audioStream.on('error', reject);
        });

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoPath)
                .input(audioPath)
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
        });

        fs.unlink(videoPath, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
        });
        fs.unlink(audioPath, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
        });
        const caption = `${videoTitle}`;
        await bot.sendVideo(msg.chat.id, outputPath, { caption });
        fs.unlink(outputPath, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
        });

    } catch (error) {
        await bot.sendMessage(msg.chat.id, 'There was an issue downloading the video. 🚨');
    }
};

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});
