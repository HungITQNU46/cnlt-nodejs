const students = require('../data/students');

const validateStudent = (data, isUpdate = false, id = null) => {
    // 1. Kiểm tra Tên
    if (!isUpdate || data.name !== undefined) {
        if (!data.name || data.name.trim().length < 2) return "Tên phải có ít nhất 2 ký tự";
    }

    // 2. Kiểm tra Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isUpdate || data.email !== undefined) {
        if (!data.email || !emailRegex.test(data.email)) return "Email sai định dạng";
        const duplicate = students.find(s => s.email === data.email && s.id != id && !s.isDeleted);
        if (duplicate) return "Email đã tồn tại";
    }

    // 3. Kiểm tra Tuổi
    if (!isUpdate || data.age !== undefined) {
        if (data.age === undefined || data.age < 16 || data.age > 60) return "Tuổi phải từ 16 đến 60";
    }

    return null;
};

exports.getAll = (req, res) => {
    let { name, class: className, sort, page = 1, limit = 2 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    
    let data = students.filter(s => !s.isDeleted);

    if (name) data = data.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    if (className) data = data.filter(s => s.class === className);
    if (sort === 'age_desc') data.sort((a, b) => b.age - a.age);

    const total = data.length;
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    
    res.json({ page, limit, total, data: paginatedData });
};

exports.getById = (req, res) => {
    const student = students.find(s => s.id == req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(student);
};

exports.create = (req, res) => {
    // Kiểm tra thông tin bắt buộc
    const { name, email, age, class: className } = req.body;
    if (!name || !email || !age || !className) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const error = validateStudent(req.body, false);
    if (error) return res.status(400).json({ message: error });

    const newStudent = { 
        id: Date.now(), 
        ...req.body, 
        isDeleted: false 
    };
    students.push(newStudent);
    res.status(201).json(newStudent);
};

exports.update = (req, res) => {
    const id = req.params.id;
    const student = students.find(s => s.id == id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    
    const error = validateStudent(req.body, true, id);
    if (error) return res.status(400).json({ message: error });
    
    Object.assign(student, req.body);
    res.json(student);
};

exports.delete = (req, res) => {
    const student = students.find(s => s.id == req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    
    student.isDeleted = true;
    res.json({ message: "Đã xóa (soft delete)" });
};
// 5.1. API thống kê tổng quan
exports.getStats = (req, res) => {
    const activeStudents = students.filter(s => !s.isDeleted);
    const deletedCount = students.filter(s => s.isDeleted).length;
    
    // Tính tuổi trung bình
    const totalAge = activeStudents.reduce((sum, s) => sum + s.age, 0);
    const averageAge = activeStudents.length > 0 ? (totalAge / activeStudents.length) : 0;

    res.json({
        total: students.length,
        active: activeStudents.length,
        deleted: deletedCount,
        averageAge: parseFloat(averageAge.toFixed(2))
    });
};
// 5.2. API thống kê theo lớp
exports.getStatsByClass = (req, res) => {
    const activeStudents = students.filter(s => !s.isDeleted);
    
    // Gom nhóm và đếm theo lớp bằng reduce
    const classStats = activeStudents.reduce((acc, s) => {
        acc[s.class] = (acc[s.class] || 0) + 1;
        return acc;
    }, {});

    // Chuyển đổi object thành mảng { "class": "...", "count": ... }
    const result = Object.keys(classStats).map(className => ({
        class: className,
        count: classStats[className]
    }));

    res.json(result);
};

