const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const controller = require('../controllers/documentController');

router.post('/upload', upload.single('document'), controller.uploadDocument);
router.get('/documents', controller.getDocuments);
router.put('/documents/:id', controller.updateDocument);
router.delete('/documents/:id', controller.deleteDocument);

module.exports = router;
