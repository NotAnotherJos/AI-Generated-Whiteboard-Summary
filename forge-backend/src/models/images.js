const { pgTable, uuid, varchar, text, jsonb, timestamp, pgEnum, index } = require('drizzle-orm/pg-core');
const { users } = require('./users');

// Task status enum
const statusEnum = pgEnum('status', ['pending', 'processing', 'completed', 'failed']);

const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  image_url: text('image_url').notNull(),
  summary: text('summary'),
  status: statusEnum('status').notNull().default('pending'),
  model_name: text('model_name').notNull(),
  prompt: text('prompt').notNull(),
  prompt_type: varchar('prompt_type', { length: 50 }).notNull().default('general'),
  language: varchar('language', { length: 50 }).notNull().default('English'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  // Composite index for history queries
  userIdCreatedAtIdx: index('idx_images_user_id_created_at').on(table.user_id, table.created_at),
}));

module.exports = { images, statusEnum }; 
