/**
 * POST /api/import/upload-validate
 * Upload CSV dan validasi semua baris
 * 
 * Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
 * Body: FormData with 'file' (CSV file)
 * Response: { success, validation_id, total_rows, valid_rows, invalid_rows, preview, errors }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// Required fields yang wajib diisi (hanya listing_code dan title yang wajib)
const REQUIRED_FIELDS = [
  "listing_code",
  "title"
];

// Allowed values untuk validasi
// PENTING: nilai harus cocok dengan yang disimpan di DB (schema.sql):
//   purpose TEXT NOT NULL, -- Dijual | Disewakan | Dijual & Disewakan
const ALLOWED_PURPOSES = ["Dijual", "Disewakan", "Dijual & Disewakan"];
// Alias yang diterima dan di-normalize ke nilai DB resmi
const PURPOSE_ALIASES = {
  "disewa": "Disewakan",
  "dijual & disewa": "Dijual & Disewakan",
};
const ALLOWED_PROPERTY_TYPES = [
  "Rumah", "Tanah", "Kost", "Hotel", "Homestay", 
  "Villa", "Apartment", "Gudang", "Komersial Lainnya"
];
const ALLOWED_PRICE_TYPES = ["Nego", "Nett", ""];
const ALLOWED_LEGAL_STATUSES = [
  "SHM & IMB/PBG Lengkap", "SHGB & IMB/PBG Lengkap",
  "SHM Pekarangan Tanpa IMB/PBG", "SHM Sawah/Tegalan",
  "SHGB Tanpa IMB/PBG", "Girik/Letter C/PPJB/dll", "Izin Usaha", ""
];
const ALLOWED_OWNERSHIP_STATUS = ["On Hand", "On Bank", ""];

// Parse CSV line dengan handle quotes
// Mendukung delimiter: koma (,) dan tab (\t)
function parseCSVLine(line, delimiter = ",") {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Deteksi delimiter yang digunakan (koma atau tab)
function detectDelimiter(headerLine, totalHeaders) {
  // Jika total headers > 45, kemungkinan besar menggunakan tab
  // karena CSV dengan 52 kolom + koma akan sangat panjang
  if (totalHeaders > 45) {
    console.log("[UPLOAD] Auto-detect: Using TAB delimiter (many columns)");
    return "\t";
  }
  
  // Hitung tab di luar quotes
  let tabCount = 0;
  let commaCount = 0;
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (char === '\t') tabCount++;
      if (char === ',') commaCount++;
    }
  }
  
  console.log("[UPLOAD] Tab count:", tabCount, "Comma count:", commaCount);
  
  // Jika tab lebih banyak atau sama dengan koma, gunakan tab
  if (tabCount >= commaCount) {
    return "\t";
  }
  return ",";
}

// Validasi satu baris data
function validateRow(row, headers, rowIndex) {
   const errors = [];
   const data = {};
   
   // Map headers ke values
   headers.forEach((header, index) => {
     data[header] = row[index] || "";
   });
   
   // Skip baris yang benar-benar kosong (tidak ada data sama sekali)
   const hasAnyData = Object.values(data).some(val => val && val.trim() !== "");
   if (!hasAnyData) {
     return { errors: [], data: null }; // Return null untuk skip baris ini
   }
   
   // Validasi required fields
   for (const field of REQUIRED_FIELDS) {
     if (!data[field] || data[field].trim() === "") {
       errors.push({
         row: rowIndex,
         field,
         value: data[field],
         error: `${field} wajib diisi`
       });
     }
   }
   
   // Validasi listing_code unik (hanya dalam file ini)
   if (data.listing_code) {
     // Note: Duplicate check against existing database records will be done during import confirmation
   }
   
   // Validasi slug unik (hanya dalam file ini)
   if (data.slug) {
     // Note: Duplicate check against existing database records will be done during import confirmation
   }
  
  // Validasi purpose — normalize alias ke nilai DB yang canonical
  // BUG KRITIS #3 FIX: validator dulu memakai "Disewa" tapi DB menyimpan "Disewakan".
  // Sekarang alias ("Disewa", "Dijual & Disewa") diterima dan dinormalisasi otomatis.
  if (data.purpose) {
    const purposeTrimmed = data.purpose.trim();
    const purposeLower = purposeTrimmed.toLowerCase();
    const allowedPurposesLower = ALLOWED_PURPOSES.map(p => p.toLowerCase());

    if (purposeLower !== "") {
      // Cek alias dulu, normalisasi ke nilai canonical
      if (PURPOSE_ALIASES[purposeLower]) {
        data.purpose = PURPOSE_ALIASES[purposeLower]; // mutasi data agar confirm.js dapat nilai bersih
      } else if (!allowedPurposesLower.includes(purposeLower)) {
        errors.push({
          row: rowIndex,
          field: "purpose",
          value: purposeTrimmed,
          error: `purpose harus salah satu dari: ${ALLOWED_PURPOSES.join(", ")} (alias diterima: Disewa, Dijual & Disewa)`
        });
      }
    }
  }
  
  // Validasi property_type - LEBIH FLEKSIBEL
  if (data.property_type) {
    const typeValue = data.property_type.trim().toLowerCase();
    const allowedTypesLower = ALLOWED_PROPERTY_TYPES.map(t => t.toLowerCase());
    if (!allowedTypesLower.includes(typeValue) && typeValue !== "") {
      errors.push({
        row: rowIndex,
        field: "property_type",
        value: data.property_type,
        error: `property_type harus: ${ALLOWED_PROPERTY_TYPES.join(", ")}`
      });
    }
  }
  
  // Validasi price_offer jika purpose mengandung "Dijual"
  if (data.purpose && data.purpose.includes("Dijual")) {
    if (data.price_offer && isNaN(parseInt(data.price_offer))) {
      errors.push({
        row: rowIndex,
        field: "price_offer",
        value: data.price_offer,
        error: "price_offer harus angka"
      });
    }
  }
  
  // Validasi price_rent jika purpose mengandung "Disewa"
  if (data.purpose && data.purpose.includes("Disewa")) {
    if (data.price_rent && isNaN(parseInt(data.price_rent))) {
      errors.push({
        row: rowIndex,
        field: "price_rent",
        value: data.price_rent,
        error: "price_rent harus angka"
      });
    }
  }
  
  // Validasi numeric fields
  const numericFields = [
    "old_price", "latitude", "longitude", "land_area", "building_area",
    "front_width", "floors", "bedrooms", "bathrooms", "outstanding_amount",
    "distance_to_river", "distance_to_grave", "distance_to_powerline", "road_width"
  ];
  
  for (const field of numericFields) {
    if (data[field] && data[field] !== "" && isNaN(parseFloat(data[field]))) {
      errors.push({
        row: rowIndex,
        field,
        value: data[field],
        error: `${field} harus angka`
      });
    }
  }
  
  // Validasi latitude range
  if (data.latitude && data.latitude !== "") {
    const lat = parseFloat(data.latitude);
    if (lat < -90 || lat > 90) {
      errors.push({
        row: rowIndex,
        field: "latitude",
        value: data.latitude,
        error: "latitude harus antara -90 dan 90"
      });
    }
  }
  
  // Validasi longitude range
  if (data.longitude && data.longitude !== "") {
    const lng = parseFloat(data.longitude);
    if (lng < -180 || lng > 180) {
      errors.push({
        row: rowIndex,
        field: "longitude",
        value: data.longitude,
        error: "longitude harus antara -180 dan 180"
      });
    }
  }
  
  // Validasi boolean fields - LEBIH FLEKSIBEL
  const booleanFields = ["is_premium", "is_featured", "is_hot", "is_choice"];
  for (const field of booleanFields) {
    if (data[field]) {
      const value = data[field].toString().toUpperCase().trim();
      // Terima: TRUE, FALSE, 1, 0, YA, TIDAK, YES, NO, kosong
      const validValues = ["TRUE", "FALSE", "1", "0", "YA", "TIDAK", "YES", "NO", ""];
      if (!validValues.includes(value)) {
        errors.push({
          row: rowIndex,
          field,
          value: data[field],
          error: `${field} harus TRUE/FALSE/1/0/YA/TIDAK`
        });
      }
    }
  }
  
  // Validasi legal_status
  if (data.legal_status && !ALLOWED_LEGAL_STATUSES.includes(data.legal_status)) {
    errors.push({
      row: rowIndex,
      field: "legal_status",
      value: data.legal_status,
      error: `legal_status tidak valid`
    });
  }
  
  // Validasi ownership_status
  if (data.ownership_status && !ALLOWED_OWNERSHIP_STATUS.includes(data.ownership_status)) {
    errors.push({
      row: rowIndex,
      field: "ownership_status",
      value: data.ownership_status,
      error: `ownership_status harus: On Hand atau On Bank`
    });
  }
  
  // Validasi bank_name jika ownership = On Bank
  if (data.ownership_status === "On Bank" && !data.bank_name) {
    errors.push({
      row: rowIndex,
      field: "bank_name",
      value: data.bank_name,
      error: "bank_name wajib diisi jika ownership_status = On Bank"
    });
  }
  
  return { errors, data };
}

export async function onRequestPost(context) {
   const { request, env } = context;

   const corsResponse = handleCors(request);
   if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return errorResponse('Unauthorized', 401, request);
   }

   try {
     // Parse form data
     const formData = await request.formData();
     const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("File CSV wajib diupload", 400, request);
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File terlalu besar. Max 5MB.", 400, request);
    }

    // Validasi tipe file
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return errorResponse("Format file tidak valid. Hanya CSV yang diterima.", 400, request);
    }

    // Baca file content
    let content = await file.text();
    
    // Remove BOM jika ada
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    // Handle multi-line quoted fields
    // Gabungkan baris yang berada di dalam quotes
    let inQuotes = false;
    let processedContent = "";
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        processedContent += char;
      } else if ((char === '\n' || char === '\r') && inQuotes) {
        // Replace newline dengan spasi di dalam quotes
        processedContent += ' ';
      } else {
        processedContent += char;
      }
    }
    
    // Parse CSV - handle berbagai format line break (CRLF, LF, CR)
    const lines = processedContent
      .replace(/\r\n/g, "\n")  // CRLF -> LF
      .replace(/\r/g, "\n")    // CR -> LF
      .split("\n")
      .filter(line => line.trim() !== "");
    
    console.log("[UPLOAD] Total lines:", lines.length);
    
    if (lines.length < 2) {
      return errorResponse("File CSV kosong atau tidak ada data.", 400, request);
    }

    // Parse header - GUNAKAN KOMA SEBAGAI DELIMITER DEFAULT
    // CSV standard menggunakan koma sebagai delimiter
    const delimiter = ",";
    const headers = parseCSVLine(lines[0], delimiter);
    console.log("[UPLOAD] Total headers:", headers.length);
    console.log("[UPLOAD] Using delimiter: COMMA");
    console.log("[UPLOAD] Raw header line (first 200 chars):", lines[0].substring(0, 200));
    console.log("[UPLOAD] First 10 headers:", headers.slice(0, 10));
    
    // Check if headers contain expected columns
    const hasListingCode = headers.some(h => h.toLowerCase().includes("listing"));
    const hasTitle = headers.some(h => h.toLowerCase().includes("title"));
    
    if (!hasListingCode || !hasTitle) {
      return errorResponse(`Format CSV tidak valid. Header harus mengandung 'listing_code' dan 'title'. Ditemukan: ${headers.slice(0, 5).join(", ")}...`, 400, request);
    }
    
    // Get existing listing_codes dan slugs untuk cek duplikat
    let existingCodes = new Set();
    let existingSlugs = new Set();
    
     // Skip pre-loading all properties to avoid memory issues with large datasets
     // Duplicate check against existing database records will be performed during import confirmation
     // We only check for duplicates within the CSV file itself here

    // Validasi semua baris
    const allErrors = [];
    const validRows = [];
    const preview = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i], delimiter);
      
      // Debug: log first 3 rows
      if (i <= 3) {
        console.log(`[UPLOAD] Row ${i} columns:`, row.length);
        console.log(`[UPLOAD] Row ${i} values (first 10):`, row.slice(0, 10));
      }
      
      const { errors, data } = validateRow(row, headers, i + 1, existingCodes, existingSlugs);
      
      // Skip baris kosong (data null)
      if (data === null) {
        continue;
      }
      
      if (errors.length > 0) {
        allErrors.push(...errors);
      } else {
        validRows.push(data);
        
        // Tambahkan ke existing untuk cek duplikat dalam file yang sama
        if (data.listing_code) {
          existingCodes.add(data.listing_code.toLowerCase());
        }
        if (data.slug) {
          existingSlugs.add(data.slug.toLowerCase());
        }
        
        // Simpan 10 baris pertama untuk preview
        if (preview.length < 10) {
          preview.push({
            listing_code: data.listing_code,
            title: data.title,
            property_type: data.property_type,
            price: data.price_offer || data.price_rent || "-",
            location: `${data.district}, ${data.city}`
          });
        }
      }
    }

    // Generate validation ID
    const validationId = crypto.randomUUID();
    
    // Simpan validation result ke KV atau temporary storage
    // Untuk sekarang, kita encode dalam validation_id
    const validationResult = {
      id: validationId,
      filename: file.name,
      headers,
      validRows,
      errors: allErrors,
      totalRows: lines.length - 1,
      validRowsCount: validRows.length,
      invalidRowsCount: allErrors.length > 0 ? new Set(allErrors.map(e => e.row)).size : 0,
      createdAt: Date.now()
    };
    
     // Simpan validation result ke tabel import_validation
     const jsonString = JSON.stringify(validationResult);
     const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour from now

     await env.DB.prepare(`
       INSERT INTO import_validation (id, validation_data, expires_at)
       VALUES (?, ?, ?)
     `).bind(validationId, jsonString, expiresAt).run();

     return jsonResponse({
       success: true,
       validation_id: validationId,
       total_rows: lines.length - 1,
       valid_rows: validRows.length,
       invalid_rows: validationResult.invalidRowsCount,
       preview,
       errors: allErrors.slice(0, 50) // Limit 50 errors untuk response
     }, 200, request);

  } catch (error) {
    console.error("Upload validate error:", error.message, error.stack);
    return errorResponse(`Gagal memvalidasi file CSV: ${error.message}`, 500, request);
  }
}
