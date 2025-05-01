const API_URL = process.env.NEXT_PUBLIC_API;

export interface CarData {
  id: string;
  carBrand: string;
  carModel: string;
  modelYear: number;
  fuelType: string;
  transmissionType: string;
  carStatus: string;
  location: string;
  exceptedPrice: number;
  images: string[];
  km: number;
  ownerName: string;
  description: string;
  postedDate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export const carService = {
  async getCars(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, string>
  ): Promise<PaginatedResponse<CarData>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Convert filters to backend format and remove empty values
      const filterArray = Object.entries(filters || {})
        .filter(([_, value]) => value !== undefined && value !== "")
        .map(([field, value]) => ({
          field:
            field === "brand"
              ? "carBrand"
              : field === "status"
              ? "carStatus"
              : field,
          condition: "==",
          value: field === "year" ? parseInt(value) : value,
        }));

      const response = await fetch(`${API_URL}/cars?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: filterArray }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch cars");
      }

      return {
        data: data.data || [],
        total: data.pagination?.total || 0,
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasMore: data.pagination?.hasMore || false,
      };
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  },

  async getCarById(id: string): Promise<CarData> {
    try {
      const response = await fetch(`${API_URL}/cars/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch car details: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || "Failed to fetch car details");
    } catch (error) {
      throw error;
    }
  },
};
