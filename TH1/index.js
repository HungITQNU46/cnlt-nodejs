const http = require('http');

const server = http.createServer((req, res) => {
    console.log('URL truy cập:', req.url);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    if (req.url === '/') {
        res.writeHead(200);
        res.end('Trang chủ');
    } 
    else if (req.url === '/about') {
        res.writeHead(200);
        res.end('Trang giới thiệu');
    } 
    else if (req.url === '/contact') {
        res.writeHead(200);
        res.end('Trang liên hệ');
    } 
    else {
        res.writeHead(404);
        res.end('Không tìm thấy trang');
    }
    console.log("TH1 NodeJS server running");
});
server.listen(3000, () => {
    console.log('App listening on port 3000');
});