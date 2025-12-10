import { useState, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (filters: {
    type: 'jual' | 'sewa';
    keyword: string;
    propertyType: string;
  }) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [type, setType] = useState<'jual' | 'sewa'>('jual');
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = useCallback(() => {
    console.log('Search submitted:', { type, keyword, propertyType });
    onSearch({ type, keyword, propertyType });
  }, [type, keyword, propertyType, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setKeyword('');
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Toggle Jual/Sewa */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Tipe:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setType('jual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              type === 'jual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Jual
          </button>
          <button
            onClick={() => setType('sewa')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              type === 'sewa'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sewa
          </button>
        </div>
      </div>

      {/* Layout Horizontal */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Dropdown Jenis Properti */}
        <div className="flex-1 min-w-0">
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors duration-200">
              <SelectValue placeholder="Jenis Properti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rumah">Rumah</SelectItem>
              <SelectItem value="apartemen">Apartemen</SelectItem>
              <SelectItem value="tanah">Tanah</SelectItem>
              <SelectItem value="ruko">Ruko</SelectItem>
              <SelectItem value="kantor">Kantor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Keyword */}
        <div className="flex-1 min-w-0 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Cari lokasi, nama properti..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-12 h-12 text-base border-2 focus:border-blue-500 transition-colors duration-200"
              autoComplete="off"
              spellCheck="false"
            />
            {keyword && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tombol Filter Lanjutan */}
        <Button
          variant="outline"
          className="h-12 px-4 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>

        {/* Tombol Cari */}
        <Button
          onClick={handleSearch}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
        >
          Cari
        </Button>
      </div>
    </div>
  );
}
