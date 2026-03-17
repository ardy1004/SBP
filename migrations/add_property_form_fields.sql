-- Migration: Add More Columns to Property Details Table
-- For comprehensive property form with dynamic fields

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_details' AND table_schema = 'public') THEN
        -- Tujuan Transaksi
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'tujuan') THEN
            ALTER TABLE public.property_details ADD COLUMN tujuan TEXT CHECK (tujuan IS NULL OR tujuan IN ('Dijual', 'Disewakan', 'Dijual & Disewakan'));
        END IF;
        
        -- Harga Jual
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'harga_jual') THEN
            ALTER TABLE public.property_details ADD COLUMN harga_jual NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'harga_jual_nego') THEN
            ALTER TABLE public.property_details ADD COLUMN harga_jual_nego BOOLEAN DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'harga_jual_nett') THEN
            ALTER TABLE public.property_details ADD COLUMN harga_jual_nett BOOLEAN DEFAULT false;
        END IF;
        
        -- Harga Sewa
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'harga_sewa_tahunan') THEN
            ALTER TABLE public.property_details ADD COLUMN harga_sewa_tahunan NUMERIC;
        END IF;
        
        -- Alamat Lengkap
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'alamat_lengkap') THEN
            ALTER TABLE public.property_details ADD COLUMN alamat_lengkap TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'google_maps_link') THEN
            ALTER TABLE public.property_details ADD COLUMN google_maps_link TEXT;
        END IF;
        
        -- Dynamic Fields Based on Property Type
        -- Rumah
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'luas_tanah') THEN
            ALTER TABLE public.property_details ADD COLUMN luas_tanah NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'luas_bangunan') THEN
            ALTER TABLE public.property_details ADD COLUMN luas_bangunan NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'lebar_depan') THEN
            ALTER TABLE public.property_details ADD COLUMN lebar_depan NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jumlah_lantai') THEN
            ALTER TABLE public.property_details ADD COLUMN jumlah_lantai INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'kamar_tidur') THEN
            ALTER TABLE public.property_details ADD COLUMN kamar_tidur INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'kamar_mandi') THEN
            ALTER TABLE public.property_details ADD COLUMN kamar_mandi INTEGER;
        END IF;
        
        -- Kost Specific
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jenis_kost') THEN
            ALTER TABLE public.property_details ADD COLUMN jenis_kost TEXT CHECK (jenis_kost IS NULL OR jenis_kost IN ('Putra', 'Putri', 'Campur'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'ruang_penjaga') THEN
            ALTER TABLE public.property_details ADD COLUMN ruang_penjaga BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'token_listrik_perkamar') THEN
            ALTER TABLE public.property_details ADD COLUMN token_listrik_perkamar BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'harga_sewa_kamar_bulan') THEN
            ALTER TABLE public.property_details ADD COLUMN harga_sewa_kamar_bulan NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'biaya_pengeluaran_bulan') THEN
            ALTER TABLE public.property_details ADD COLUMN biaya_pengeluaran_bulan NUMERIC;
        END IF;
        
        -- Hotel Specific
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jenis_hotel') THEN
            ALTER TABLE public.property_details ADD COLUMN jenis_hotel TEXT CHECK (jenis_hotel IS NULL OR jenis_hotel IN ('Budget / Melati', 'Bintang 1', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Boutique'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'income_rata_rata_bulan') THEN
            ALTER TABLE public.property_details ADD COLUMN income_rata_rata_bulan NUMERIC;
        END IF;
        
        -- Apartment Specific
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'no_unit') THEN
            ALTER TABLE public.property_details ADD COLUMN no_unit TEXT;
        END IF;
        
        -- Kelengkapan
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'kelengkapan') THEN
            ALTER TABLE public.property_details ADD COLUMN kelengkapan TEXT CHECK (kelengkapan IS NULL OR kelengkapan IN ('Fully Furnished', 'Semi Furnished', 'Unfurnished'));
        END IF;
        
        -- Legalitas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'legalitas') THEN
            ALTER TABLE public.property_details ADD COLUMN legalitas TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'status_legalitas') THEN
            ALTER TABLE public.property_details ADD COLUMN status_legalitas TEXT CHECK (status_legalitas IS NULL OR status_legalitas IN ('On Hand', 'On Bank'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'bank_terkait') THEN
            ALTER TABLE public.property_details ADD COLUMN bank_terkait TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'outstanding_bank') THEN
            ALTER TABLE public.property_details ADD COLUMN outstanding_bank NUMERIC;
        END IF;
        
        -- Lingkungan
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'dekat_sungai') THEN
            ALTER TABLE public.property_details ADD COLUMN dekat_sungai BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jarak_sungai_meter') THEN
            ALTER TABLE public.property_details ADD COLUMN jarak_sungai_meter NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'dekat_makam') THEN
            ALTER TABLE public.property_details ADD COLUMN dekat_makam BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jarak_makam_meter') THEN
            ALTER TABLE public.property_details ADD COLUMN jarak_makam_meter NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'dekat_sutet') THEN
            ALTER TABLE public.property_details ADD COLUMN dekat_sutet BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'jarak_sutet_meter') THEN
            ALTER TABLE public.property_details ADD COLUMN jarak_sutet_meter NUMERIC;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'lebar_jalan_meter') THEN
            ALTER TABLE public.property_details ADD COLUMN lebar_jalan_meter NUMERIC;
        END IF;
        
        -- Additional Info
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'alasan_dijual') THEN
            ALTER TABLE public.property_details ADD COLUMN alasan_dijual TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_details' AND column_name = 'deskripsi_properti') THEN
            ALTER TABLE public.property_details ADD COLUMN deskripsi_properti TEXT;
        END IF;
        
    END IF;
END $$;

RAISE NOTICE 'Property details columns migration completed';
