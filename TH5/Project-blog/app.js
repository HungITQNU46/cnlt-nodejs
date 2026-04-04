const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const BlogPost = require('./models/BlogPost'); 
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost:27017/blogDB')
    .then(() => console.log('Kết nối thành công blogDB!'))
    .catch(err => console.log('Lỗi kết nối:', err));
app.get('/', async (req, res) => {
    const posts = await BlogPost.find({});
    res.render('index', { posts });
});
app.get('/blogposts/new', (req, res) => {
    res.render('create'); 
});
app.post('/blogposts/store', async (req, res) => {
    try {
        await BlogPost.create(req.body);
        res.redirect('/');
    } catch (error) {
        res.redirect('/blogposts/new');
    }
});
app.get('/edit/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        res.render('edit', { post });
    } catch (error) {
        res.redirect('/');
    }
});
app.post('/update/:id', async (req, res) => {
    try {
        await BlogPost.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});
app.get('/blogposts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        res.render('detail', { post }); 
    } catch (error) {
        res.redirect('/');
    }
});
app.get('/delete/:id', async (req, res) => {
    try {
        await BlogPost.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

app.listen(3000, () => console.log("Server đang chạy tại http://localhost:3000"));