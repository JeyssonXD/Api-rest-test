var conection = require('./../knexfile').development;

var knex = require("knex")(conection);

module.exports = knex;