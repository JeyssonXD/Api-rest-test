
exports.up = function(knex, Promise) {
  var user = knex.schema.withSchema('public').table("user",(table)=>{
    table.string('confirmationToken').defaultTo("");
  });
  return Promise.all([user]);
};

exports.down = function(knex, Promise) {
  
};
