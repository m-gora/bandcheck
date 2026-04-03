import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const bands = sqliteTable('bands', {
  id: text('id').primaryKey(),
  maId: text('ma_id'),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  genres: text('genres').notNull(), // JSON array
  location: text('location'),
  formed: text('formed'),
  website: text('website'),
  imageUrl: text('image_url'),
  members: text('members'), // JSON array
  safetyStatus: text('safety_status').notNull().default('pending'), // 'safe' | 'unsafe' | 'controversial' | 'pending'
  reviewCount: integer('review_count').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  bandId: text('band_id').notNull().references(() => bands.id),
  userId: text('user_id').notNull(),
  userDisplayName: text('user_display_name').notNull(),
  userAvatarUrl: text('user_avatar_url'),
  safetyAssessment: text('safety_assessment').notNull(), // 'safe' | 'unsafe' | 'controversial'
  comment: text('comment').notNull(),
  evidence: text('evidence'), // JSON array
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
