const http = require('http');
const fs = require('fs');
const path = require('path');
// Sử dụng chuẩn URL mới thay cho url.parse()
const appEmitter = require('./events/AppEmitter');

const server = http.createServer((req, res) => {
    // Sử dụng WHATWG URL API (Sửa lỗi DeprecationWarning)
    const baseURL = `http://${req.headers.host}`;
    const parsedUrl = new URL(req.url, baseURL);
    const pathname = parsedUrl.pathname;

    const serveHTML = (fileName) => {
        const filePath = path.join(__dirname, 'views', fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end('Lỗi đọc file HTML');
                }
                return;
            }
            if (!res.headersSent) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(data);
                res.end();
            }
        });
    };

    // QUAN TRỌNG: Thêm return trước mỗi lần gọi serveHTML hoặc res.end
    if (pathname === '/') {
        return serveHTML('index.html');
    } 
    
    if (pathname === '/events') {
        appEmitter.emit('logAction', 'Truy cập trang Events');
        return serveHTML('events.html');
    } 
    
    if (pathname === '/request') {
        return serveHTML('request.html');
    } 
    
    if (pathname === '/streams') {
        if (req.method === 'POST') {
            const writeStream = fs.createWriteStream('./data/story.txt', { flags: 'a' });
            req.pipe(writeStream);
            return req.on('end', () => {
                res.writeHead(302, { 'Location': '/streams' });
                res.end();
            });
        }
        return serveHTML('streams.html');
    }

    if (pathname === '/json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'success' }));
    }

    if (pathname === '/image') {
        const imgPath = path.join(__dirname, 'public/images/logo.png');
        if (fs.existsSync(imgPath)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            return fs.createReadStream(imgPath).pipe(res);
        }
        return res.end('Image not found');
    }

    // Trang 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});