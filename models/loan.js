'use strict';

module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: 'Book id is required.'
        }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: 'Patron id is required.'
        }
      }
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Loaned On is required.'
        },
        isDate: {
          msg: 'Loaned On must be a valid date.'
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Return By is required'
        },
        isDate: {
          msg: 'Return By must be a date.'
        },
        isAfter: {
          args: Date('now'),
          msg: 'Return By must be a valid date.'
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
    }
  })
  Loan.associate = function(models) {
    Loan.belongsTo(models.Book, { foreignKey: "book_id" });
    Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
  };
  return Loan;
};
