CREATE TABLE "bands" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_id" text,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"genres" jsonb NOT NULL,
	"location" text,
	"formed" text,
	"website" text,
	"image_url" text,
	"members" jsonb,
	"safety_status" text DEFAULT 'pending' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"band_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_display_name" text NOT NULL,
	"user_avatar_url" text,
	"safety_assessment" text NOT NULL,
	"comment" text NOT NULL,
	"evidence" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_band_id_bands_id_fk" FOREIGN KEY ("band_id") REFERENCES "public"."bands"("id") ON DELETE no action ON UPDATE no action;