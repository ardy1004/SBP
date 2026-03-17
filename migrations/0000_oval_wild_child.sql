CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"property_id" varchar,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_analytics_id" text,
	"google_tag" text,
	"facebook_pixel" text,
	"tiktok_pixel" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode_listing" text NOT NULL,
	"judul_properti" text,
	"deskripsi" text,
	"jenis_properti" text NOT NULL,
	"luas_tanah" numeric,
	"luas_bangunan" numeric,
	"kamar_tidur" integer,
	"kamar_mandi" integer,
	"legalitas" text,
	"harga_properti" numeric NOT NULL,
	"provinsi" text NOT NULL,
	"kabupaten" text NOT NULL,
	"alamat_lengkap" text,
	"image_url" text NOT NULL,
	"image_url1" text,
	"image_url2" text,
	"image_url3" text,
	"image_url4" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_hot" boolean DEFAULT false NOT NULL,
	"is_sold" boolean DEFAULT false NOT NULL,
	"price_old" numeric,
	"is_property_pilihan" boolean DEFAULT false NOT NULL,
	"owner_contact" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_kode_listing_unique" UNIQUE("kode_listing")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;