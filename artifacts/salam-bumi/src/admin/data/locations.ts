/**
 * Data Lokasi Lengkap DI Yogyakarta
 * Sumber: Data Kemendagri & BPS
 */

export interface KecamatanData {
  nama: string;
  desa?: string[];
  kelurahan?: string[];
}

export interface KabKotaData {
  kab_kota: string;
  kecamatan: KecamatanData[];
}

export interface LocationJSON {
  provinsi: string;
  wilayah: KabKotaData[];
}

export const LOCATION_DATA: LocationJSON = {
  provinsi: "DI Yogyakarta",
  wilayah: [
    {
      kab_kota: "Kab. Kulon Progo",
      kecamatan: [
        { nama: "Galur", desa: ["Brosot", "Galur", "Hargorejo", "Kaligono", "Padokan", "Sidomulyo"] },
        { nama: "Girimulyo", desa: ["Banjararum", "Banjarasri", "Girimulyo", "Hargorejo", "Jatimulyo", "Jonggrangan", "Ngargosari"] },
        { nama: "Kalibawang", desa: ["Banjararum", "Banjarsari", "Kalibawang", "Ngargosari", "Sedayu", "Sriharjo"] },
        { nama: "Kokap", desa: ["Banjararum", "Banjarsari", "Kokap", "Sriharjo"] },
        { nama: "Lendah", desa: ["Banjararum", "Banjarsari", "Lendah", "Sedayu", "Sriharjo"] },
        { nama: "Nanggulan", desa: ["Banjararum", "Banjarsari", "Nanggulan", "Sedayu"] },
        { nama: "Panjatan", desa: ["Banjararum", "Banjarsari", "Panjatan", "Sedayu", "Sriharjo"] },
        { nama: "Pengasih", desa: ["Banjararum", "Banjarsari", "Pengasih", "Sedayu", "Sriharjo"] },
        { nama: "Samigaluh", desa: ["Banjararum", "Banjarsari", "Samigaluh", "Sedayu"] },
        { nama: "Sentolo", desa: ["Banjararum", "Banjarsari", "Sentolo", "Sedayu", "Sriharjo"] },
        { nama: "Temon", desa: ["Banjararum", "Banjarsari", "Sedayu", "Sriharjo", "Temon"] },
        { nama: "Wates", desa: ["Banjararum", "Banjarsari", "Sedayu", "Sriharjo", "Wates"] },
      ],
    },
    {
      kab_kota: "Kab. Bantul",
      kecamatan: [
        { nama: "Banguntapan", desa: ["Baturetno", "Jagalan", "Jambidan", "Potorono", "Tamanan", "Wirokerten"] },
        { nama: "Bantul", desa: ["Bantul", "Palbapang", "Sabdodadi", "Selopamioro", "Trirenggo"] },
        { nama: "Bambanglipuro", desa: ["Mulyodadi", "Mulyosari", "Sriharjo", "Srimulyo"] },
        { nama: "Dlingo", desa: ["Dlingo", "Jatimulyo", "Mangunharjo", "Terong"] },
        { nama: "Imogiri", desa: ["Girirejo", "Imogiri", "Karangtengah", "Sriharjo", "Selopamioro"] },
        { nama: "Jetis", desa: ["Canden", "Gunungketur", "Jogotirto", "Patalan", "Sumberagung"] },
        { nama: "Kasihan", desa: ["Bangunharjo", "Ngestiharjo", "Tamantirto", "Tirtonirmolo"] },
        { nama: "Kretek", desa: ["Donotirto", "Parangtritis", "Tirtomulyo", "Tirtohargo"] },
        { nama: "Pajangan", desa: ["Guwosari", "Sendangsari", "Trihanggo"] },
        { nama: "Pandak", desa: ["Gilangharjo", "Srikayangan", "Trirenggo"] },
        { nama: "Piyungan", desa: ["Sitimulyo", "Srimulyo"] },
        { nama: "Pleret", desa: ["Bawuran", "Pleret", "Segoroyoso", "Wonokromo"] },
        { nama: "Pundong", desa: ["Panjangrejo", "Sriharjo", "Srimulyo"] },
        { nama: "Sanden", desa: ["Gadingsari", "Gadingharjo", "Murtigading", "Srigading"] },
        { nama: "Sedayu", desa: ["Argodadi", "Argomulyo", "Argosari", "Srimulyo"] },
        { nama: "Sewon", desa: ["Bangunharjo", "Pendowoharjo", "Timbulharjo", "Trimulyo"] },
        { nama: "Srandakan", desa: ["Donotirto", "Srimulyo", "Tirtomulyo"] },
      ],
    },
    {
      kab_kota: "Kab. Gunungkidul",
      kecamatan: [
        { nama: "Gedangsari", desa: ["Bejiharjo", "Gedangsari", "Hargosari", "Mertelu", "Ngawen", "Sampang", "Sriharjo"] },
        { nama: "Girisubo", desa: ["Balong", "Girisubo", "Jatiayu", "Jelbuk", "Karangwuni", "Pucung", "Songbanyu"] },
        { nama: "Karangmojo", desa: ["Bejiharjo", "Karangmojo", "Nglindur", "Piyaman", "Sampang", "Sriharjo"] },
        { nama: "Ngawen", desa: ["Bejiharjo", "Ngawen", "Sampang", "Sriharjo"] },
        { nama: "Nglipar", desa: ["Katongan", "Nglipar", "PENGKOL", "Sriharjo"] },
        { nama: "Paliyan", desa: ["Paliyan", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Panggang", desa: ["Panggang", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Patuk", desa: ["Bunder", "Patuk", "Sampang", "Sriharjo", "Terbah"] },
        { nama: "Playen", desa: ["Bejiharjo", "Playen", "Sampang", "Sriharjo"] },
        { nama: "Ponjong", desa: ["Ponjong", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Purwosari", desa: ["Purwosari", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Rongkop", desa: ["Rongkop", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Saptosari", desa: ["Saptosari", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Semanu", desa: ["Semanu", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Semin", desa: ["Semin", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Tanjungsari", desa: ["Tanjungsari", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Tepus", desa: ["Tepus", "Sampang", "Sriharjo", "Umbulrejo"] },
        { nama: "Wonosari", desa: ["Wonosari", "Sampang", "Sriharjo", "Umbulrejo"] },
      ],
    },
    {
      kab_kota: "Kab. Sleman",
      kecamatan: [
        { nama: "Berbah", desa: ["Jogotirto", "Kalitirto", "Tebon", "Tirtoagung"] },
        { nama: "Cangkringan", desa: ["Argomulyo", "Glagaharjo", "Kepuharjo", "Kaliurang", "Wukirsari"] },
        { nama: "Depok", kelurahan: ["Caturtunggal", "Condongcatur", "Maguwoharjo"] },
        { nama: "Gamping", kelurahan: ["Ambarketawang", "Banyuraden", "Nogotirto", "Trihanggo"] },
        { nama: "Godean", desa: ["Godean", "Kembangbiru", "Sidoagung", "Sidoarum", "Sidoluhur"] },
        { nama: "Kalasan", desa: ["Kalasan", "Purwomartani", "Selomartani", "Tamanmartani", "Tirtomartani"] },
        { nama: "Minggir", desa: ["Banyuraden", "Sendangadi", "Sinduharjo", "Sidoagung"] },
        { nama: "Mlati", desa: ["Sendangadi", "Sinduharjo", "Sidoagung", "Tirtoadi"] },
        { nama: "Moyudan", desa: ["Moyudan", "Sidoagung", "Sidoarum", "Sidoluhur"] },
        { nama: "Ngaglik", desa: ["Donoharjo", "Minomartani", "Sariharjo", "Sinduharjo"] },
        { nama: "Ngemplak", desa: ["Bimomartani", "Sinduharjo", "Sidoagung", "Wedomartani"] },
        { nama: "Pakem", desa: ["Candibinangun", "Hargobinangun", "Pakembinangun", "Purwobinangun"] },
        { nama: "Prambanan", desa: ["Bokoharjo", "Gayamharjo", "Madurejo", "Sambirejo", "Wukirsari"] },
        { nama: "Seyegan", desa: ["Margodadi", "Margoluwih", "Margorejo", "Margosari", "Seyegan"] },
        { nama: "Sleman", kelurahan: ["Caturtunggal", "Trihanggo", "Sidoagung"] },
        { nama: "Tempel", desa: ["Banyuraden", "Lumbungrejo", "Margorejo", "Sidoagung", "Tempel"] },
        { nama: "Turi", desa: ["Donokerto", "Girikerto", "Kembangargo", "Wonokerto"] },
      ],
    },
    {
      kab_kota: "Kota Yogyakarta",
      kecamatan: [
        { nama: "Danurejan", kelurahan: ["Bausasran", "Gowongan", "Sokonandi", "Tegalpanggung"] },
        { nama: "Gedongtengen", kelurahan: ["Pringgokusuman", "Sosromenduran"] },
        { nama: "Gondokusuman", kelurahan: ["Baciro", "Demangan", "Klitren", "Kotabaru", "Terban"] },
        { nama: "Gondomanan", kelurahan: ["Ngupasan", "Prawirodirjan"] },
        { nama: "Jetis", kelurahan: ["Bumijo", "Cokrodiningratan", "Gowongan"] },
        { nama: "Kotagede", kelurahan: ["Jagalan", "Prenggan", "Purbayan", "Rejowinangun"] },
        { nama: "Kraton", kelurahan: ["Kadipaten", "Panembahan", "Patehan", "Pekunden"] },
        { nama: "Mantrijeron", kelurahan: ["Gedongkiwo", "Mantrijeron", "Suryatmajan"] },
        { nama: "Mergangsan", kelurahan: ["Brontokusuman", "Keparakan", "Mergangsan", "Wirogunan"] },
        { nama: "Ngampilan", kelurahan: ["Ngampilan", "Notoprajan"] },
        { nama: "Pakualaman", kelurahan: ["Gunungketur", "Pakualaman"] },
        { nama: "Tegalrejo", kelurahan: ["Bener", "Karangkajen", "Kricak", "Tegalrejo"] },
        { nama: "Umbulharjo", kelurahan: ["Giwangan", "Muja Muju", "Pandeyan", "Semaki", "Soroyudan", "Tahunan", "Warungboto"] },
        { nama: "Wirobrajan", kelurahan: ["Pakuncen", "Patangpuluhan", "Wirobrajan"] },
      ],
    },
  ],
};

// Ambil daftar kabupaten/kota
export function getCities(): string[] {
  return LOCATION_DATA.wilayah.map(w => w.kab_kota);
}

// Ambil daftar kecamatan berdasarkan kabupaten/kota
export function getDistricts(city: string): string[] {
  const wilayah = LOCATION_DATA.wilayah.find(w => w.kab_kota === city);
  return wilayah ? wilayah.kecamatan.map(k => k.nama) : [];
}

// Ambil desa/kelurahan berdasarkan kecamatan
export function getVillages(city: string, district: string): string[] {
  const wilayah = LOCATION_DATA.wilayah.find(w => w.kab_kota === city);
  if (!wilayah) return [];
  const kec = wilayah.kecamatan.find(k => k.nama === district);
  if (!kec) return [];
  return kec.desa || kec.kelurahan || [];
}

// Search lokasi (untuk fitur pencarian)
export function searchLocations(query: string): { city: string; district: string }[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: { city: string; district: string }[] = [];

  for (const wilayah of LOCATION_DATA.wilayah) {
    for (const kec of wilayah.kecamatan) {
      if (kec.nama.toLowerCase().includes(q)) {
        results.push({ city: wilayah.kab_kota, district: kec.nama });
        continue;
      }
      const items = kec.desa || kec.kelurahan || [];
      for (const desa of items) {
        if (desa.toLowerCase().includes(q)) {
          results.push({ city: wilayah.kab_kota, district: kec.nama });
          break;
        }
      }
    }
  }

  return results.slice(0, 15);
}
