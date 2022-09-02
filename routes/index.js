const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/catalog');
});
router.get('/about', (req, res) => {
    res.send("index router's about page");
});

module.exports = router;