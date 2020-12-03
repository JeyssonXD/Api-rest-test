
exports.up = function(knex, Promise) {

  var user = knex.schema.withSchema('public').createTable("user",(table)=>{
    table.increments('id').primary().notNullable();
    table.index('email');
    table.unique('email');
    table.string('email');
    table.string('password');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
  return Promise.all([user]);
};

exports.down = function(knex, Promise) {
  
};
