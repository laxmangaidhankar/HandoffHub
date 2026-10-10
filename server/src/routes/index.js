const express = require('express');

const router = express.Router();

const roomRoutes = require('./v1/roomRoutes');
const envRoutes = require('./v1/envRoutes');

router.use('/rooms', roomRoutes);
router.use('/rooms', envRoutes);


module.exports = router;