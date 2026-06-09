import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { 
  FileSpreadsheet, Clock, CheckCircle, XCircle, RotateCcw,
  Download, Eye, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/api-client";
import { formatDate, getStatusColor, getStatusLabel, isRollbackAvailable } from "../utils/csv";

interface ImportLog {
  id: string;
  filename: string;
  total_rows: number;
  success_count: number;
  failed_count: number;
  status: string;
  rollback_available_until: number;
  created_at: number;
}

export default function ImportHistory() {
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/import/history?page=${page}&limit=10`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setImports(data.data || []);
          setTotalPages(data.pagination?.total_pages || 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrorReport = async (importId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/import/error-report/${importId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `error_report_${importId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleRollback = async (importId: string) => {
    if (!confirm("Apakah Anda yakin ingin rollback? Semua properti dari import ini akan dihapus.")) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/import/rollback/${importId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (response.ok) {
        fetchHistory(); // Refresh list
      }
    } catch (error) {
      console.error("Rollback error:", error);
    }
  };

  return (
    <AdminLayout title="Import History">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Riwayat Import CSV</h2>
          <Link href="/admin/import-csv">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Import Baru
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Memuat data...</span>
          </div>
        ) : imports.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Import</h3>
            <p className="text-gray-500 mb-4">Anda belum pernah melakukan import CSV.</p>
            <Link href="/admin/import-csv">
              <Button className="bg-primary hover:bg-primary/90">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Mulai Import
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Tanggal</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">File</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Total</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Sukses</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Gagal</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {imports.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(item.created_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]">{item.filename}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">{item.total_rows}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-green-600">{item.success_count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-red-600">{item.failed_count}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {item.failed_count > 0 && item.status === "completed" && (
                            <button
                              onClick={() => handleDownloadErrorReport(item.id)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download Error Report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === "completed" && isRollbackAvailable(item.rollback_available_until) && (
                            <button
                              onClick={() => handleRollback(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rollback"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-4">
                <div className="text-sm text-gray-500">Hal {page} dari {totalPages}</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
