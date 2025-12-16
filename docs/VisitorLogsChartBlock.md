# VisitorLogsChartBlock

A React component that visualizes visitor logs data using an area chart, showing visitor counts per date over the last 30 days.

## Features

- **Area Chart Visualization**: Displays visitor counts using a gradient-filled area chart
- **30-Day Data Range**: Shows data for the last 30 days with proper date formatting
- **Trend Analysis**: Calculates and displays trend percentage compared to the previous week
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Shows loading indicator while fetching data
- **Error Handling**: Gracefully handles errors with fallback sample data
- **Role-Based Access**: Supports both root users (all areas) and admin users (assigned areas)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `areaId` | `string` | Yes | - | Area ID or "all" for root users |
| `title` | `string` | No | "Thống kê truy cập" | Chart title |
| `description` | `string` | No | "Biểu đồ số lượng khách truy cập theo ngày" | Chart description |

## Usage

### Basic Usage

```tsx
import VisitorLogsChartBlock from "@/components/blocks/VisitorLogsChartBlock"

function Dashboard() {
  return (
    <VisitorLogsChartBlock 
      areaId="area-123"
      title="Thống kê truy cập khu vực"
      description="Biểu đồ số lượng khách truy cập trong 30 ngày gần đây"
    />
  )
}
```

### Root User (All Areas)

```tsx
<VisitorLogsChartBlock 
  areaId="all"
  title="Thống kê truy cập toàn hệ thống"
  description="Biểu đồ số lượng khách truy cập toàn hệ thống trong 30 ngày gần đây"
/>
```

### Admin User (Specific Area)

```tsx
<VisitorLogsChartBlock 
  areaId={user.account_id}
  title="Thống kê truy cập khu vực"
  description="Biểu đồ số lượng khách truy cập khu vực trong 30 ngày gần đây"
/>
```

## Data Structure

The component expects visitor logs data with the following structure:

```typescript
interface VisitorLog {
  id: string
  area_id: string
  created_at: string
  // ... other fields
}
```

## Chart Features

### Visual Elements
- **Gradient Fill**: Uses CSS variables for consistent theming
- **Smooth Curves**: Natural curve interpolation for better visual appeal
- **Grid Lines**: Subtle grid lines for better readability
- **Tooltips**: Interactive tooltips showing exact values

### Data Processing
- **Date Grouping**: Groups visitor logs by date
- **30-Day Range**: Automatically generates data for the last 30 days
- **Trend Calculation**: Compares current week vs. previous week
- **Total Count**: Displays total visitors for the period

### Responsive Behavior
- **Mobile Optimized**: Adapts chart size for mobile devices
- **Touch Friendly**: Optimized for touch interactions
- **Flexible Layout**: Responsive container that adapts to parent size

## Styling

The component uses Tailwind CSS classes and CSS variables for consistent theming:

- **Primary Colors**: Uses `--primary` CSS variable for chart colors
- **Card Design**: Follows the established card component design system
- **Typography**: Consistent with the application's typography scale
- **Spacing**: Uses the established spacing scale

## Dependencies

- **Recharts**: For chart rendering
- **date-fns**: For date manipulation and formatting
- **Lucide React**: For icons
- **Tailwind CSS**: For styling

## Error Handling

The component includes comprehensive error handling:

1. **API Errors**: Catches and logs API errors gracefully
2. **Fallback Data**: Generates sample data when real data is unavailable
3. **Loading States**: Shows appropriate loading indicators
4. **Empty States**: Handles cases with no visitor data

## Performance Considerations

- **Memoized Calculations**: Trend calculations are optimized
- **Efficient Rendering**: Uses React best practices for performance
- **Data Caching**: Leverages React's useEffect for data fetching
- **Responsive Updates**: Only re-renders when necessary

## Accessibility

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Supports keyboard interactions
- **High Contrast**: Works with high contrast themes
- **Semantic HTML**: Uses proper semantic elements

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **ES6+ Features**: Requires modern JavaScript support

## Examples

See `src/components/example/VisitorLogsChartExample.tsx` for complete usage examples.

## Integration

The component is already integrated into:

- **MainManagePage**: Dashboard overview for both root and admin users
- **Admin Layout**: Available for use in other admin pages
- **Area Management**: Can be used in area-specific dashboards

## Future Enhancements

Potential improvements for future versions:

- **Date Range Selection**: Allow users to select custom date ranges
- **Multiple Metrics**: Show additional metrics like unique visitors, page views
- **Export Functionality**: Allow data export in various formats
- **Real-time Updates**: WebSocket integration for live data updates
- **Comparative Views**: Side-by-side comparison of different periods
