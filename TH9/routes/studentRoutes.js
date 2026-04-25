const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/authMiddleware');
const c = require('../controllers/studentController');

router.get('/stats/class', c.getStatsByClass);
router.get('/stats', c.getStats);

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', requireLogin, c.create);
router.put('/:id', requireLogin, c.update);
router.delete('/:id', requireLogin, c.delete);

module.exports = router;