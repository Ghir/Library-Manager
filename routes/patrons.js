const express = require('express'),
  router = express.Router(),
  Book = require("../models").Book,
  Loan = require("../models").Loan,
  Patron = require("../models").Patron;

// GET all patrons
router.get('/', (req, res) => {
  Patron.findAll({ order: [["first_name", "ASC"]] }).then(patrons => {
    res.render("patrons/patrons", { patrons });
  }).catch(error => {
    res.send(500, error);
  });
});

// GET patron details
router.get("/details/:id", (req, res) => {
  const patron = Patron.find({ where: { id: req.params.id } })
  const loans = Loan.findAll({ where: { patron_id: req.params.id }, include: [{ model: Book }] })
  Promise.all([patron, loans]).then(data => {
    res.render("patrons/details", { patron: data[0], loans: data[1] });
  }).catch(function (error) {
    res.send(500, error);
  });
});

// POST edit patron details
router.post("/details/:id", function (req, res) {
  Patron.update(req.body, { where: [{ id: req.params.id }] }).then(() => {
    res.redirect('/patrons');
  }).catch(error => {
    if (error.name === 'SequelizeValidationError') {
      const patron = Patron.find({ where: { id: req.params.id } })
      const loans = Loan.findAll({ where: { patron_id: req.params.id }, include: [{ model: Book }] })
      Promise.all([patron, loans]).then(data => {
        res.render("patrons/details", { patron: data[0], loans: data[1], errors: error.errors });
      })
    } else {
      res.status(500).send(error);
    }
  })
})

// GET new patron
router.get('/new', (req, res) => {
  res.render("patrons/new");
});

// POST new patron
router.post('/new', (req, res) => {
  Patron.create(req.body).then(() => {
    res.redirect("/patrons")
  }).catch(error => {
    if (error.name === "SequelizeValidationError") {
      res.render("patrons/new", { errors: error.errors })
    } else {
      throw error;
    }
  })
})

module.exports = router;
