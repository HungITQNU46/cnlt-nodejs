const express = require('express');
const session = require('express-session');

const app = express();


const { loggerMiddleware } = require('./middleware/loggerMiddleware');
const { errorHandler } = require('./middleware/errorHandler');

app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(loggerMiddleware);

app.use('/', require('./routes/authRoutes'));
app.use('/students', require('./routes/studentRoutes'));

// Phần 4: So sánh đồng bộ/bất đồng bộ
app.get('/heavy-sync', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 3000) {} // Block
    res.send("Sync done");
});

app.get('/heavy-async', (req, res) => {
    setTimeout(() => res.send("Async done"), 3000); // Non-block
});

app.listen(3000, () => {
    console.log('Server chạy tại cổng 3000');
});