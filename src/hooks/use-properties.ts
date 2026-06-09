/**
 * Hooks untuk fetch data properti dari API.
 * Mock data sudah TIDAK digunakan — semua data dari API real.
 */
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api-client";
import type { PropertyQueryParams } from "@/lib/api-client";

/**
 * Fetch list properti dengan filter opsional.
 * Menggunakan tanstack-query untuk caching dan deduplisasi request.
 */
export function useProperties(params?: PropertyQueryParams) {
  return useQuery({
    queryKey: ["/api/properties", params],
    queryFn: () => propertiesApi.getAll(params),
    staleTime: 60_000, // Data dianggap fresh selama 1 menit
  });
}

/**
 * Fetch satu properti berdasarkan slug atau ID.
 */
export function useProperty(slugOrId: string) {
  return useQuery({
    queryKey: ["/api/properties", slugOrId],
    queryFn: () => propertiesApi.getBySlug(slugOrId),
    enabled: !!slugOrId,
    staleTime: 60_000,
  });
}
