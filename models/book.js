"use strict";
module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define("Book",
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Title is required."
          }
        }
      },
      author: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Author is required."
          }
        }
      },
      genre: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Genre is required."
          }
        }
      },
      first_published: DataTypes.INTEGER
    },
  );
  Book.associate = function(models) {
    Book.hasOne(models.Loan, { foreignKey: "book_id" });
  };
  return Book;
};
