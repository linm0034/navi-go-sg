import { Hotel, FilterType } from '@/types/hotel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Star } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  rank: number;
  displayMode: 'overall' | 'price' | FilterType;
}

export default function HotelCard({ hotel, rank, displayMode }: HotelCardProps) {
  const getDisplayScore = () => {
    if (displayMode === 'overall') {
      return hotel.overallScore.toFixed(2);
    } else if (displayMode === 'price') {
      return `$${hotel.price}`;
    } else {
      return hotel.filterScores[displayMode]?.toFixed(2) || 'N/A';
    }
  };

  const getScoreLabel = () => {
    if (displayMode === 'overall') return 'Overall Score';
    if (displayMode === 'price') return 'Price';
    return 'Proximity Score';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-sm font-semibold">
                #{rank}
              </Badge>
              <CardTitle className="text-lg">{hotel.name}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
              <p className="text-sm font-semibold">{hotel.overallScore.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm font-semibold">${hotel.price}</p>
            </div>
          </div>
        </div>
        
        {displayMode !== 'overall' && displayMode !== 'price' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{getScoreLabel()}</p>
                <p className="text-sm font-semibold text-primary">{getDisplayScore()}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 inline mr-1" />
          {hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}
        </div>
      </CardContent>
    </Card>
  );
}
