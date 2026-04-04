const BlogPost = require('../models/BlogPost');
// xem danh sách bai viết
exports.getAllPosts = async (req, res) => {
    const posts = await BlogPost.find({}).sort({ _id: -1 });
    res.render('index', { posts });
};
//tạo
exports.renderCreateForm = (req, res) => {
    res.render('create');
};
//lưu
exports.storePost = async (req, res) => {
    await BlogPost.create(req.body);
    res.redirect('/');
};
//xem
exports.getPostDetail = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
};
// Xóa
exports.deletePost = async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
};