/**
 * CSV Utility Functions
 * Helper functions untuk parsing dan formatting CSV
 */

// Download file sebagai Blob
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format number ke Rupiah
export function formatRupiah(num: number | string): string {
  const n = typeof num === "string" ? parseInt(num) : num;
  if (isNaN(n)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// Format timestamp ke tanggal Indonesia
export function formatDate(timestamp: number): string {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Cek apakah rollback masih tersedia
export function isRollbackAvailable(rollbackUntil: number): boolean {
  if (!rollbackUntil) return false;
  return Math.floor(Date.now() / 1000) < rollbackUntil;
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    rolled_back: "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

// Get status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    processing: "Sedang Diproses",
    completed: "Selesai",
    failed: "Gagal",
    rolled_back: "Di-Rollback",
  };
  return labels[status] || status;
}
