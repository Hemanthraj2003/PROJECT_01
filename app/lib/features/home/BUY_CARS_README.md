# Buy Cars Feature - Flutter Implementation

## Overview
This implementation mirrors the React Native BuyCar feature with the same functionality, UI consistency, and backend integration.

## Files Created

### 1. Main Screens
- **`lib/features/home/buy_cars_screen.dart`**
  - Main car listing screen with search and filter functionality
  - Implements pagination with infinite scroll
  - Pull-to-refresh support
  - Search bar with real-time filtering
  - Filter button with active filter count indicator

- **`lib/features/home/car_detail_screen.dart`**
  - Detailed car view screen
  - Image carousel with pagination dots
  - Car specifications in gradient card
  - Overview and description sections
  - Chat button and like functionality (ready for integration)

### 2. Widgets
- **`lib/features/home/widgets/car_card.dart`**
  - Reusable car card component
  - Displays car image, price, model, year
  - Shows key specs (km, fuel type, transmission)
  - Gradient overlay and "View Details" badge

- **`lib/features/home/widgets/filter_bottom_sheet.dart`**
  - Bottom sheet modal for filtering cars
  - Filter categories:
    - **Price Range**: < 1L, 1L-3L, 3L-6L, 6L+
    - **Fuel Type**: Petrol, Diesel, CNG, EV, Hybrid
    - **KM Driven**: 0-50k, 50k-100k, 100k+
    - **Transmission**: Manual, Automatic
  - Active filter count display
  - Apply and Reset buttons

### 3. Updated Files
- **`lib/core/services/api_service.dart`**
  - Added queryParams support to POST requests
  - Enhanced error logging

- **`lib/core/services/car_service.dart`**
  - Updated `fetchFilteredCars` to handle search term and query params properly

- **`lib/core/models/car_model.dart`**
  - Enhanced JSON parsing to handle both API response formats
  - Maps `km` → `kilometerDriven`, `modelYear` → `manufacturingYear`, etc.

- **`lib/features/home/home_screen.dart`**
  - Integrated BuyCarsScreen as the first tab

## Features Implemented

### ✅ Search Functionality
- Real-time search bar
- Searches through car brands and models
- Clear button to reset search
- Shows "No cars found" message when no results

### ✅ Filter System
- Beautiful bottom sheet modal with gradient header
- Multiple filter categories
- Visual feedback for selected filters
- Filter count indicator on button
- Apply and Reset functionality
- Filters are applied to backend API

### ✅ Car Listing
- Grid/List view of cars
- Car cards with images, prices, and specs
- Infinite scroll pagination
- Pull-to-refresh
- Loading indicators for better UX
- Empty state handling

### ✅ Car Details
- Full-screen car detail view
- Image carousel with smooth transitions
- Pagination dots for images
- Gradient info card with car specs
- Overview section (date, owner, location)
- Description section
- Chat button (ready for integration)
- Like/Favorite button (ready for user provider integration)

### ✅ UI/UX Consistency
- Matches React Native design with Flutter Material Design
- Uses same color scheme from `app_colors.dart`
- Typography system matches React Native version
- Gradient backgrounds and buttons
- Smooth animations and transitions
- Proper spacing and shadows

## Backend Integration

### API Endpoints Used
- **POST** `/api/cars` - Fetch filtered cars with pagination
- Query Parameters: `page`, `limit`, `searchTerm`
- Body: `{ filters: [...] }`

### Filter Format
```dart
List<Map<String, dynamic>> filters = [
  {'field': 'carStatus', 'condition': '==', 'value': 'approved'},
  {'field': 'exceptedPrice', 'condition': '>=', 'value': 100000},
  {'field': 'exceptedPrice', 'condition': '<=', 'value': 300000},
  {'field': 'fuelType', 'condition': 'in', 'value': ['Petrol', 'Diesel']},
  // ... more filters
];
```

## Best Practices Followed

1. **State Management**
   - Proper state handling with StatefulWidget
   - Loading states for async operations
   - Error handling with user feedback

2. **Performance**
   - Lazy loading with pagination
   - Image caching through `Image.network`
   - Efficient list rendering with `ListView.builder`
   - Scroll controller optimization

3. **Code Organization**
   - Separation of concerns (screens, widgets, services)
   - Reusable components
   - Clean file structure

4. **Error Handling**
   - Network connectivity checks
   - API error handling
   - User-friendly error messages via SnackBars
   - Graceful fallbacks for missing data

5. **UI/UX**
   - Consistent theming
   - Smooth animations
   - Loading indicators
   - Empty states
   - Pull-to-refresh
   - Responsive design

## Next Steps / TODOs

1. **Chat Integration**
   - Connect "Chat With Us" button to chat service
   - Implement chat navigation

2. **Like/Favorite Integration**
   - Connect like button to user provider
   - Persist liked cars
   - Add to favorites list

3. **User Authentication**
   - Restrict chat to authenticated users
   - Show user-specific liked cars

4. **Additional Features**
   - Share car details
   - Call owner directly
   - Compare cars
   - Save search filters

## Testing

To test the implementation:

1. Run the Flutter app
2. Navigate to the Home screen (Buy Cars tab)
3. Try searching for cars
4. Apply different filters
5. Scroll to load more cars
6. Tap on a car to view details
7. Try pull-to-refresh

## Dependencies

Make sure these packages are in `pubspec.yaml`:
- `provider` - State management
- `http` - API calls
- `connectivity_plus` - Network status

## Notes

- All car data comes from the production API: `https://friendscars.vercel.app/api`
- Images are loaded from external URLs with proper error handling
- The implementation follows Material Design guidelines while maintaining brand colors
- Code is well-commented and follows Dart conventions
