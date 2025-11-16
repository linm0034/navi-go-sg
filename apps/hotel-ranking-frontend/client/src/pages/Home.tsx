import { useState, useEffect } from 'react';
import { Hotel, SortType, FilterType } from '@/types/hotel';
import { HotelService } from '@/services/hotelService';
import HotelCard from '@/components/HotelCard';
import FilterPanel from '@/components/FilterPanel';
import { Loader2, Hotel as HotelIcon, AlertCircle } from 'lucide-react';
import { APP_TITLE } from '@/const';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>('overall');
  const [filterType, setFilterType] = useState<FilterType | null>(null);

  useEffect(() => {
    loadHotels();
  }, [sortType, filterType]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await HotelService.fetchRankingAsync(sortType, filterType || undefined);
      setHotels(data);
    } catch (err) {
      console.error('Failed to load hotels:', err);
      setError('无法连接到后端服务器。请确保 Java 后端正在运行并检查 API 地址配置。');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortType: SortType, newFilterType?: FilterType) => {
    setSortType(newSortType);
    if (newSortType === 'filter' && newFilterType) {
      setFilterType(newFilterType);
    } else if (newSortType !== 'filter') {
      setFilterType(null);
    }
  };

  const getDisplayMode = (): 'overall' | 'price' | FilterType => {
    if (sortType === 'filter' && filterType) return filterType;
    if (sortType === 'price_low' || sortType === 'price_high') return 'price';
    return 'overall';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <HotelIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Singapore Hotel Ranking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discover the best hotels based on your preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                sortType={sortType}
                filterType={filterType}
                onSortChange={handleSortChange}
              />
            </div>
          </aside>

          {/* Hotel List */}
          <div className="lg:col-span-3">
            {/* Error Notice */}
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-900 dark:text-red-100">连接错误</AlertTitle>
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                  <br />
                  <span className="text-sm mt-2 block">
                    后端地址: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading hotels...</p>
                </div>
              </div>
            ) : hotels.length === 0 && !error ? (
              <div className="text-center py-20">
                <HotelIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : hotels.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Top {Math.min(10, hotels.length)} Hotels
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Showing {hotels.length} result{hotels.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid gap-4">
                  {hotels.slice(0, 10).map((hotel, index) => (
                    <HotelCard
                      key={hotel.name}
                      hotel={hotel}
                      rank={index + 1}
                      displayMode={getDisplayMode()}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 {APP_TITLE}. Hotel data is for demonstration purposes.</p>
        </div>
      </footer>
    </div>
  );
}
