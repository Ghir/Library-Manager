const express = require('express'),
  router = express.Router(),
  Book = require("../models").Book,
  Loan = require("../models").Loan,
  Patron = require("../models").Patron,
  moment = require('moment'),
  Sequelize = require("sequelize"),
  Op = Sequelize.Op;

// GET all books
router.get('/', (req, res) => {
  Book.findAll({ order: [["title", "ASC"]] }).then(books => {
    res.render("books/books", { books, category: "Books" });
  }).catch(error => {
    res.send(500, error);
  });
});

// GET overdue
router.get('/overdue', (req, res) => {
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null,
        return_by: { [Op.lte]: moment().format("YYYY-MM-DD") }
      }
    }],
    order: [["title", "ASC"]]
  }).then(books => {
    res.render("books/books", { books, category: "Overdue Books" });
  }).catch(error => {
    res.send(500, error);
  });
});

// GET checked_out
router.get('/checked_out', (req, res) => {
  Book.findAll({
    include: [{
      model: Loan,
      where: { returned_on: null }
    }],
    order: [["title", "ASC"]]
  }).then(books => {
    res.render("books/books", { books, category: "Checked Out Books" });
  }).catch(error => {
    res.send(500, error);
  });
});

// GET new book
router.get('/new', (req, res) => {
  res.render("books/new");
});

// POST new book
router.post('/new', (req, res) => {
  Book.create(req.body).then(() => {
    res.redirect("/books")
  }).catch(error => {
    if (error.name === "SequelizeValidationError") {
      res.render("books/new", { errors: error.errors })
    } else {
      throw error;
    }
  })
})

// GET book details
router.get("/details/:id", (req, res) => {
  const book = Book.findById(req.params.id);
  const loans = Loan.findAll({ where: { book_id: req.params.id }, include: [{ model: Patron }, { model: Book }] });
  Promise.all([book, loans]).then(data => {
    res.render("books/details", { book: data[0], loans: data[1] });
  }).catch(error => {
    res.send(500, error);
  });
});

// POST edit book details
router.post("/details/:id", (req, res) => {
  Book.update(req.body, { where: [{ id: req.params.id }] }).then(() => {
    res.redirect('/books');
  }).catch(error => {
    if (error.name === 'SequelizeValidationError') {
      const book = Book.findById(req.params.id);
      const loans = Loan.findAll({ where: { book_id: req.params.id }, include: [{ model: Patron }, { model: Book }] });
      Promise.all([book, loans]).then(data => {
        res.render('books/details', { book: data[0], loans: data[1], errors: error.errors });
      })
    } else {
      res.status(500).send(error);
    }
  })
})

module.exports = router;
