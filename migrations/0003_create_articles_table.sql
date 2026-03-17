-- Create articles table for blog functionality
CREATE TABLE "articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"thumbnail_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text,
	"tags" text[],
	"meta_title" text,
	"meta_description" text,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"author_id" varchar,
	"views" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);