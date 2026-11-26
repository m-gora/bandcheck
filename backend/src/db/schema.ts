import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bands = pgTable('bands', {
  id: text('id').primaryKey(),
  maId: text('ma_id'),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  genres: jsonb('genres').$type<string[]>().notNull(),
  location: text('location'),
  formed: text('formed'),
  website: text('website'),
  imageUrl: text('image_url'),
  members: jsonb('members').$type<string[]>(),
  sourceMetadata: jsonb('source_metadata').$type<Record<string, unknown>>(),
  safetyStatus: text('safety_status').notNull().default('pending'), // 'safe' | 'unsafe' | 'controversial' | 'pending'
  reviewCount: integer('review_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('bands_name_idx').on(table.name),
  uniqueIndex('bands_ma_id_unique').on(table.maId).where(sql`${table.maId} IS NOT NULL`),
]);

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  bandId: text('band_id').notNull().references(() => bands.id),
  userId: text('user_id').notNull(),
  userDisplayName: text('user_display_name').notNull(),
  userAvatarUrl: text('user_avatar_url'),
  safetyAssessment: text('safety_assessment').notNull(), // 'safe' | 'unsafe' | 'controversial'
  comment: text('comment').notNull(),
  evidence: jsonb('evidence').$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
