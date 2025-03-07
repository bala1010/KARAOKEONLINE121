require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());


const API_KEY = "AIzaSyCRjklLTU63-HugOTMP41AQ0EiDy23E-fg";
const PORT = process.env.PORT || 3000;

// 📌 API tìm kiếm bài hát trên YouTube
app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm" });

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: query,
                key: API_KEY,
                maxResults: 5,
                type: "video"
            }
        });

        const results = response.data.items.map((item) => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.json(results);
    } catch (error) {
    console.error("🔍 Lỗi API YouTube:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Lỗi khi tìm kiếm YouTube", details: error.message });
}


});

// 📌 API lấy link nhạc từ YouTube
app.get("/api/stream", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.status(400).json({ error: "Thiếu videoId" });

    try {
        const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
        const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

        if (!format || !format.url) return res.status(500).json({ error: "Không tìm thấy link phát" });

        res.json({ streamUrl: format.url });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy link YouTube" });
    }
});

// 📌 Chạy server
app.listen(PORT, () => console.log(`🎵 Server karaoke chạy tại http://localhost:${PORT}`));

"scripts": {
  "start": "node server.js"
}

