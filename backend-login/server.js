const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;
const secretKey = 'your-secret-key'; // 替換成更安全的金鑰

app.use(cors());
app.use(bodyParser.json());

// 模擬使用者資料庫 (實際應用中應使用真正的資料庫)
const users = [];

// 註冊 API
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '請提供使用者名稱和密碼' });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: '使用者名稱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: '註冊成功' });
});

// 登入 API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);

    if (!user) {
        return res.status(401).json({ message: '使用者名稱或密碼錯誤' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: '使用者名稱或密碼錯誤' });
    }
});

// 受保護的 API (需要驗證 token)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: `歡迎，${req.user.username}！這是受保護的內容。` });
});

app.listen(port, () => {
    console.log(`後端伺服器運行在 http://localhost:${port}`);
});