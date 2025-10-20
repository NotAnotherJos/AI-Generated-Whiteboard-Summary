const { pgTable, varchar, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = { users }; 
