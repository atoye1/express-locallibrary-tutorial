const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Wiki router's index page");
});
router.get('/about', (req, res) => {
    res.send("Wiki router's about page");
});

router.get('/about/:userId/books/:bookId', (req, res) => {
    console.log(req.params.userId, req.params.bookId);
    res.send("Wiki router's specific page" + req.params.userId + req.params.bookId);
});
module.exports = router;