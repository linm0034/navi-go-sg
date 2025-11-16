import { Hotel, SortType, FilterType } from '@/types/hotel';

export class HotelService {
  private static API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  /**
   * 从后端 API 获取酒店排名数据
   * @param sortType 排序类型：overall | price_low | price_high | filter
   * @param filter 设施类别（仅当 sortType 为 filter 时需要）
   * @returns Promise<Hotel[]>
   */
  static async fetchRankingAsync(
    sortType: SortType,
    filter?: FilterType
  ): Promise<Hotel[]> {
    const params = new URLSearchParams({
      sortType,
      ...(filter && { filter }),
    });

    const url = `${this.API_BASE_URL}/api/ranking?${params}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch hotels from backend:', error);
      throw error;
    }
  }

  /**
   * 测试后端连接
   * @returns 是否连接成功
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/ranking?sortType=overall`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}
