const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Có lỗi xảy ra trên server" });
};
module.exports = { errorHandler };