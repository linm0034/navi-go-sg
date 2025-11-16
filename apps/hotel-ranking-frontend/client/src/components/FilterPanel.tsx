import { SortType, FilterType, FILTER_LABELS } from '@/types/hotel';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, Filter } from 'lucide-react';

interface FilterPanelProps {
  sortType: SortType;
  filterType: FilterType | null;
  onSortChange: (sortType: SortType, filterType?: FilterType) => void;
}

export default function FilterPanel({ sortType, filterType, onSortChange }: FilterPanelProps) {
  const handleSortTypeChange = (value: string) => {
    if (value === 'filter') {
      // 如果选择了 filter 但没有设施类别，默认选择 mrt
      const defaultFilter = filterType || 'mrt';
      onSortChange('filter', defaultFilter as FilterType);
    } else {
      onSortChange(value as SortType);
    }
  };

  const handleFilterTypeChange = (value: string) => {
    onSortChange('filter', value as FilterType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Ranking Options
        </CardTitle>
        <CardDescription>
          Choose how to sort and filter the hotel rankings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort By
          </label>
          <Select value={sortType} onValueChange={handleSortTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sorting method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Score</SelectItem>
              <SelectItem value="price_low">Price (Low to High)</SelectItem>
              <SelectItem value="price_high">Price (High to Low)</SelectItem>
              <SelectItem value="filter">By Facility Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortType === 'filter' && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Facility Category
            </label>
            <Select value={filterType || undefined} onValueChange={handleFilterTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILTER_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={sortType === 'overall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('overall')}
            >
              Overall
            </Button>
            <Button
              variant={sortType === 'price_low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('price_low')}
            >
              Price ↑
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
