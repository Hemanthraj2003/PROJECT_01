import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getQueryParams, getRequestBody, parsePaginationParams, createPaginationResponse } from '@/lib/utils';

// GET /api/cars - Get all cars with pagination
export async function GET(request: NextRequest) {
  logApiRequest(request, '/api/cars');
  
  try {
    const query = getQueryParams(request);
    const { page, limit, startAt } = parsePaginationParams(query);

    const carsQuery = db.collection("CARS");

    // Get total count
    const totalSnapshot = await carsQuery.count().get();
    const total = totalSnapshot.data().count;

    // Get paginated results
    const snapshot = await carsQuery
      .orderBy("postedDate", "desc")
      .limit(limit)
      .offset(startAt)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        createPaginationResponse([], 0, page, limit),
        { status: 200 }
      );
    }

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      createPaginationResponse(cars, total, page, limit),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Error fetching cars");
  }
}

// POST /api/cars - Get filtered cars
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/cars (filtered)');
  
  try {
    const query = getQueryParams(request);
    const body = await getRequestBody(request);
    const { page, limit, startAt } = parsePaginationParams(query);
    const searchTerm = query.searchTerm?.toLowerCase();

    let carsQuery = db.collection("CARS");
    const filters = [];

    // Combine all filters (from body and query params)
    if (body.filters && Array.isArray(body.filters)) {
      filters.push(...body.filters);
    }

    // Add query params filters
    if (query.brand) {
      filters.push({
        field: "carBrand",
        condition: "==",
        value: query.brand,
      });
    }
    if (query.model) {
      filters.push({
        field: "carModel",
        condition: "==",
        value: query.model,
      });
    }
    if (query.year) {
      filters.push({
        field: "modelYear",
        condition: "==",
        value: parseInt(query.year),
      });
    }
    if (query.fuelType) {
      filters.push({
        field: "fuelType",
        condition: "==",
        value: query.fuelType,
      });
    }
    if (query.status) {
      filters.push({
        field: "carStatus",
        condition: "==",
        value: query.status,
      });
    }

    // Validate all filters first
    for (const filter of filters) {
      if (!filter.field || !filter.condition || filter.value === undefined) {
        return NextResponse.json(
          {
            error: "Each filter should contain valid 'field', 'condition', and 'value'",
          },
          { status: 400 }
        );
      }
    }

    // Handle search with combined query
    if (searchTerm) {
      // Create search index field if it doesn't exist
      const snapshot = await carsQuery.get();

      // Filter results that match search term in brand or model
      let searchResults = snapshot.docs.filter((doc) => {
        const data = doc.data();
        const brand = data.carBrand.toLowerCase();
        const model = data.carModel.toLowerCase();
        return brand.includes(searchTerm) || model.includes(searchTerm);
      });

      // Apply other filters to search results
      searchResults = searchResults.filter((doc) => {
        const data = doc.data();
        return filters.every((filter) => {
          const value = data[filter.field];
          const filterValue =
            filter.field === "modelYear" ||
            filter.field === "exceptedPrice" ||
            filter.field === "km"
              ? Number(filter.value)
              : filter.value;

          switch (filter.condition) {
            case "==":
              return value === filterValue;
            case ">=":
              return value >= filterValue;
            case "<=":
              return value <= filterValue;
            case "in":
              return Array.isArray(filterValue) && filterValue.includes(value);
            default:
              return true;
          }
        });
      });

      // Sort by posted date and apply pagination
      const sortedResults = searchResults.sort(
        (a, b) =>
          new Date(b.data().postedDate).getTime() -
          new Date(a.data().postedDate).getTime()
      );

      const total = sortedResults.length;
      const paginatedCars = sortedResults
        .slice(startAt, startAt + limit)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      return NextResponse.json(
        createPaginationResponse(paginatedCars, total, page, limit),
        { status: 200 }
      );
    }

    // If no search term, apply filters normally
    for (const filter of filters) {
      if (
        filter.field === "modelYear" ||
        filter.field === "exceptedPrice" ||
        filter.field === "km"
      ) {
        carsQuery = carsQuery.where(
          filter.field,
          filter.condition,
          Number(filter.value)
        );
      } else {
        carsQuery = carsQuery.where(
          filter.field,
          filter.condition,
          filter.value
        );
      }
    }

    // Get total count
    const totalSnapshot = await carsQuery.count().get();
    const total = totalSnapshot.data().count;

    // Get paginated results
    const snapshot = await carsQuery
      .orderBy("postedDate", "desc")
      .limit(limit)
      .offset(startAt)
      .get();

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      createPaginationResponse(cars, total, page, limit),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getFilteredCars:", error);
    return handleApiError(error, "Failed to fetch filtered cars");
  }
}
