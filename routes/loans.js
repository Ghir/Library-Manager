const express = require('express');
const router = express.Router();
const Book = require("../models").Book;
const Loan = require("../models").Loan;
const Patron = require("../models").Patron;
const moment = require('moment');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// GET all loans
router.get('/', (req, res, next) =>  {
  Loan.findAll({
    include: [{ model: Book }, { model: Patron }],
    order: [["return_by", "ASC"]]
  }).then(loans => {
    res.render("loans/loans", { loans, category: "Loans" });
  }).catch(error => {
      res.send(500, error);
   });
});

// GET overdue
router.get('/overdue', (req, res, next) =>  {
  Loan.findAll({
    include: [{ model: Book }, { model: Patron }],
    where: {
      returned_on: null,
      return_by: {
        [Op.lte]: moment().format("YYYY-MM-DD")
      }
    },
    order: [["return_by", "ASC"]]
  }).then(loans => {
    res.render("loans/loans", { loans, category: "Overdue Loans" });
  }).catch(error => {
      res.send(500, error);
   });
});

// GET checked_out
router.get('/checked_out', (req, res, next) =>  {
  Loan.findAll({
    include: [{ model: Book }, { model: Patron }],
    where: {
      returned_on: null
    },
    order: [["return_by", "ASC"]]
  }).then(loans => {
    res.render("loans/loans", { loans, category: "Checked Out Loans" });
  }).catch(error => {
      res.send(500, error);
   });
});

// GET new loan
router.get('/new', (req, res, next) =>  {
  const book = Book.findAll();
  const patron = Patron.findAll();
  const date = moment(new Date()).format('YYYY-MM-DD');
  const dateAdd = moment(date).add(7, 'days').format('YYYY-MM-DD');
  Promise.all([book, patron]).then(data => {
    res.render("loans/new", { books: data[0], patrons: data[1], date, dateAdd })
  })
});

// POST new loan
router.post('/new', (req, res, next) => {
  Loan.create(req.body).then(loans => {
    res.redirect("/loans")
}).catch(error => {
    if(error.name === "SequelizeValidationError") {
      const book = Book.findAll();
      const patron = Patron.findAll();
      const date = moment(new Date()).format('YYYY-MM-DD');
      const dateAdd = moment(date).add(7, 'days').format('YYYY-MM-DD');
      Promise.all([book, patron]).then(data => {
        res.render("loans/new", { books: data[0], patrons: data[1], date, dateAdd, errors: error.errors })
      })
    } else {
      throw error;
    }
  })
})

// GET return book
router.get('/return/:id', (req, res, next) =>  {
  const date = moment(new Date()).format('YYYY-MM-DD');
  Loan.find({
    include: [{ model: Book }, { model: Patron }],
    where: {
      book_id: req.params.id
    }
  }).then(loan => {
      res.render("loans/return", { loan, date })
  })
})

// POST return book
router.post("/return/:id", (req, res, next) => {
  let errors = {};
  if (!req.body.returned_on) {
    errors.message = 'Please enter a valid return date.';
    const date = moment(new Date()).format('YYYY-MM-DD');
    Loan.find({
      include: [{ model: Book }, { model: Patron }],
      where: {
        book_id: req.params.id
      }
    }).then(loan => {
        res.render("loans/return", { loan, date, errors })
    })
  } else {
    Loan.update(req.body, { where: { book_id: req.params.id } }).then(loan => {
      res.redirect('/loans');
  })
 }
})

module.exports = router;
