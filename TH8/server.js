const express = require("express");
const multer = require("multer");
const formidable = require("formidable");
const fs = require("fs");
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const uploadMulter = multer({ storage: storage }).single("file");
const uploadManyFiles = multer({ storage: storage }).array("many-files", 17);
app.get("/", (req, res) => {
    res.send(`
        <h3>Upload với Multer (1 file)</h3>
        <form action="/upload-multer" method="post" enctype="multipart/form-data">
            <input type="file" name="file" />
            <button type="submit">Upload Multer</button>
        </form>
        <hr>
        <h3>Upload nhiều file (Tối đa 17 file)</h3>
        <form action="/upload-many" method="post" enctype="multipart/form-data">
            <input type="file" name="many-files" multiple>
            <button type="submit">Upload Nhiều File</button>
        </form>
        <hr>
        <h3>Upload với Formidable</h3>
        <form action="/upload-formidable" method="post" enctype="multipart/form-data">
            <input type="file" name="file" />
            <button type="submit">Upload Formidable</button>
        </form>
    `);
});
app.post("/upload-multer", (req, res) => {
    uploadMulter(req, res, (err) => {
        if (err) return res.send("Lỗi upload Multer");
        res.send("Upload thành công bằng Multer");
    });
});
app.post("/upload-many", (req, res) => {
    uploadManyFiles(req, res, (err) => {
        if (err) return res.send("Lỗi upload: " + err.message);
        res.send("Upload nhiều file thành công.");
    });
});
app.post("/upload-formidable", (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = "uploads/";
    form.parse(req, (err, fields, files) => {
        if (err) return res.send("Lỗi parse form");
        let file = Array.isArray(files.file) ? files.file[0] : files.file;
        let tmpPath = file.filepath;
        let newPath = form.uploadDir + file.originalFilename;
        
        fs.rename(tmpPath, newPath, (err) => {
            if (err) return res.send("Lỗi di chuyển file");
            res.send("Upload thành công bằng Formidable");
        });
    });
});
app.listen(8017, () => {
    console.log("Server chạy tại http://localhost:8017");
});