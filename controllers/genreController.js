const { body, validationResult } = require('express-validator');
const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
    Genre.find().sort([['type', 'ascending']]).exec((err, list_genre) => {
        if (err) { next(err); }
        console.log(list_genre);
        res.render('genre_list', { title: 'Genre List', genre_list: list_genre });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
    console.log(req.params);
    async.parallel({
        genre(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books(callback) {
            Book.find({ genre: req.params.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.genre == null) {
            const err = new Error("Genre not found");
            err.status = 404;
            return next(err);
        }
        res.render("genre_detail", {
            title: "Genre Detail",
            genre: results.genre,
            genre_books: results.genre_books
        });
    });
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
    res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body("name", "Genre name required").trim().isLength({ min: 3 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Create Genre",
                genre,
                errors: errors.array()
            });
            return;
        } else {
            Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
                if (err) {
                    return next(err);
                }

                if (found_genre) {
                    res.redirect(found_genre.url);
                } else {
                    genre.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        res.redirect(genre.url);
                    });
                }
            });
        }
    }
];
// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
    async.parallel({
        genre(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books(callback) {
            Book.find({ "genre": req.params.id }).populate('author').exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); };
        if (results.genre == null) {
            res.redirect('/catalog/genres');
        }
        res.render("genre_delete", {
            title: 'Delete Genre',
            genre: results.genre,
            genre_books: results.genre_books
        });
    });
};

function deleteGenre(req, res, next, err) {
    if (err) { return next(err); }
    res.redirect('/catalog/genres');
}
// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {

    async.parallel({
        genre: callback => {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.genre_books.length > 0) {
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
        } else {
            Genre.findByIdAndRemove(req.body.id, err => {
                if (err) { return next(err); }
                res.redirect('/catalog/genres');
            });
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {

};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
