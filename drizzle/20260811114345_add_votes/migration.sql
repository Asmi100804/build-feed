CREATE TABLE "votes" (
	"id" serial PRIMARY KEY,
	"user_id" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "votes_value_check" CHECK ("value" IN (1, -1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "votes_user_product_idx" ON "votes" ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "votes_product_idx" ON "votes" ("product_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;