import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

type SearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

export default function MapSearch({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para buscar en Nominatim (restringido a El Salvador)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setIsOpen(true);

    try {
      // Forzamos la búsqueda solo en El Salvador usando countrycodes=sv
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&countrycodes=sv&format=json&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error buscando ubicación:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (lat: string, lon: string) => {
    onLocationSelect(parseFloat(lat), parseFloat(lon));
    setIsOpen(false);
    setQuery(""); // Limpiamos la búsqueda tras seleccionar
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
      <form
        onSubmit={handleSearch}
        className="relative flex items-center w-full shadow-dropdown rounded-2xl bg-surface-card backdrop-blur-card border border-surface-border overflow-hidden"
      >
        <div className="pl-4 pr-2 text-ink-muted">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un lugar en El Salvador..."
          className="w-full py-3 pr-4 bg-transparent outline-none text-ink-primary placeholder:text-ink-muted text-sm font-medium"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="p-2 mr-1 text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="px-4 py-2 mr-1 my-1 bg-blue-solid hover:bg-blue-light text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </button>
      </form>

      {/* Dropdown de Resultados */}
      {isOpen && (results.length > 0 || isSearching) && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-surface-card backdrop-blur-card border border-surface-border rounded-2xl shadow-dropdown overflow-hidden flex flex-col max-h-60 overflow-y-auto animate-slide-down">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-ink-muted flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando lugares...
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result.lat, result.lon)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-subtle transition-colors border-b border-surface-border last:border-0"
              >
                <MapPin className="w-5 h-5 text-blue-solid shrink-0 mt-0.5" />
                <span className="text-sm text-ink-primary line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))
          ) : null}
          {!isSearching && results.length === 0 && query && (
            <div className="p-4 text-center text-sm text-ink-muted">
              No se encontraron lugares con ese nombre en El Salvador.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
