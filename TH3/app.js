const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

// DATA
const items = [
    { id:1, name:'Đà Lạt', description:'Thành phố mộng mơ', price:1500000, hot:true },
    { id:2, name:'Nha Trang', description:'Biển đẹp', price:1800000, hot:false },
    { id:3, name:'Sa Pa', description:'Vùng núi lạnh', price:2000000, hot:true },
    { id:4, name:'Phú Quốc', description:'Đảo du lịch', price:2500000, hot:false },
    { id:5, name:'Đà Nẵng', description:'Thành phố đáng sống', price:1700000, hot:true }
];

// ROUTES
app.get('/', (req, res) => {
    res.render('index', { title: 'Trang chủ' });
});

app.get('/list', (req, res) => {
    res.render('list', {
        title: 'Danh sách',
        items: items
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Liên hệ' });
});

app.get('/detail/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(x => x.id === id);

    if (!item) {
        return res.send('Không tìm thấy dữ liệu');
    }

    res.render('detail', {
        title: 'Chi tiết',
        item: item
    });
});

app.listen(5000, () => {
    console.log('http://localhost:5000');
});