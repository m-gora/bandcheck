ALTER TABLE "bands" ADD COLUMN "source_metadata" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "bands_ma_id_unique" ON "bands" USING btree ("ma_id") WHERE "bands"."ma_id" IS NOT NULL;