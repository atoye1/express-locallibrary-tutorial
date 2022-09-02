const { body, validationResult } = require("express-validator");
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');

exports.index = (req, res) => {
    async.parallel({
        book_count(callback) {
            Book.countDocuments({}, callback);
        },
        book_instance_count(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count(callback) {
            BookInstance.countDocuments({
                status: 'Available'
            }, callback);
        },
        author_count(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count(callback) {
            Genre.countDocuments({}, callback);
        }
    },
        (err, results) => {
            console.log(results);
            res.render('index', { title: 'Local Library Home', error: err, data: results });
        });
};

// Display list of all books.
exports.book_list = (req, res, next) => {
    Book.find({}, 'title author').sort({ title: 1 }).populate('author').exec(function (err, list_books) {
        if (err) { return next(err); }
        console.log(list_books);
        res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
    async.parallel({
        book(callback) {
            Book.findById(req.params.id)
                .populate("author")
                .populate("genre")
                .exec(callback);
        },
        book_instance(callback) {
            BookInstance.find({ book: req.params.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.book == null) {
            const err = new Error("Book not found");
            err.status = 404;
            return next(err);
        }
        res.render("book_detail", {
            title: results.book.title,
            book: results.book,
            book_instances: results.book_instance
        });
    });

};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
    async.parallel({
        authors(callback) {
            Author.find(callback);
        },
        genres(callback) {
            Genre.find(callback);
        },
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres
        });
    });

};

// Handle book create on POST.
exports.book_create_post = [
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
        }
        next();
    },
    body("title", "Title must not be empty.").trim().isLength({ min: 3 }).escape(),
    body("author", "Author must not be empty").trim().isLength({ min: 1 }).escape(),
    body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("isbn", "ISBN mut not be empty").trim().isLength({ min: 1 }).escape(),
    body("genre.*").escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
        });
        if (!errors.isEmpty()) {
            async.parallel({
                authors(callback) {
                    console.log("authors callback func");
                    console.log(callback);
                    Author.find(callback);
                },
                genres(callback) {
                    console.log("genres callback func");
                    console.log(callback);
                    Genre.find(callback);
                },
            }, (err, results) => {
                if (err) {
                    return next(err);
                }
                console.log(results.genres);
                for (const genre of results.genres) {
                    if (book.genre.includes(genre._id)) {
                        genre.checked = "true";
                    }
                }
                res.render("book_form", {
                    title: "Create Book",
                    authors: results.authors,
                    genres: results.genres,
                    book,
                    errors: errors.array(),
                });
            });
            return;
        }
        book.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect(book.url);
        });
    }



];
// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
    async.parallel({
        book(callback) {
            Book.findById(req.params.id).exec(callback);
        },
        bookinstances(callback) {
            BookInstance.find({ book: req.params.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.book == null) {
            res.redirect("/catalog/book");
        }
        console.log(results);
        res.render("book_delete", {
            title: "Delete Book",
            book: results.book,
            bookinstances: results.bookinstances
        });
    }
    );
};

// Handle book delete on POST.
exports.book_delete_post = (req, res, next) => {
    async.parallel({
        book(callback) {
            Book.findById(req.body.id).populate('author').populate('genre').exec(callback);
        },
        book_bookinstances(callback) {
            BookInstance.find({ "book": req.body.id }).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.book_bookinstances.length > 0) {
            res.render('book_delete', { title: 'Delete Book', book: results.book, bookinstances: results.book_bookinstances });
            return;
        } else {
            Book.findByIdAndRemove(req.body.id, err => {
                if (err) { return next(err); }
                res.redirect('/catalog/books');
            });
        }
    });
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update POST');
};