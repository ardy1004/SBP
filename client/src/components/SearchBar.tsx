import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Cari properti...",
  initialValue = "",
  className = ""
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Faster response

  // Update search when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchTerm.trim());
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10 flex-shrink-0" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary flex-1"
          data-testid="input-search-keyword"
          autoComplete="off"
          spellCheck="false"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-8 top-0 h-6 w-6 p-0 hover:bg-muted rounded-full z-10 flex-shrink-0 bg-white border border-gray-300 shadow-sm flex items-center justify-center"
            data-testid="button-clear-search"
            title="Hapus pencarian"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
