# Area User Management Components

This documentation describes the new user management components for areas.

## Components

### AreaUserBlock

The main component that displays and manages users within an area.

**Features:**

- Lists all users currently assigned to the area
- Search functionality to filter users by email, account ID, or role
- Add new users to the area
- Remove users from the area
- Role-based badge display

**Props:**

- `areaId`: string | undefined - The ID of the area to manage users for

**Usage:**

```tsx
import AreaUserBlock from "@/components/blocks/AreaUserBlock";

<AreaUserBlock areaId="your-area-id" />;
```

### UserSelectionModal

A modal component for selecting users to add to an area. Only shows users that are not currently assigned to any area.

**Features:**

- Lists all users not assigned to any area
- Search functionality
- Single user selection
- Role display with badges

**Props:**

- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Callback when modal is closed
- `onSelect`: (accountId: string) => void - Callback when a user is selected

**Usage:**

```tsx
import UserSelectionModal from "@/components/blocks/UserSelectionModal";

<UserSelectionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSelect={(accountId) => handleUserSelected(accountId)}
/>;
```

## Services

### Added to account_profiles.service.ts

**New Functions:**

1. `getAccountProfilesNotInAnyArea()`: Returns users not assigned to any area
2. `getAllAccountProfiles()`: Returns all account profiles, ordered by email

## User Interface

### AreaUserBlock Interface:

- **Header**: Shows user count and "Add User" button
- **Search Bar**: Filter users by email, ID, or role
- **User List**: Cards showing user info, role badge, and remove button
- **Empty States**: Different messages for no users vs. no search results

### UserSelectionModal Interface:

- **Header**: "Add user to area" title
- **Search Bar**: Filter available users
- **User List**: Selectable cards with user info and role badges
- **Footer**: Cancel and confirm buttons

## User Flow

1. **View Users**: AreaUserBlock automatically loads and displays users for the given area
2. **Add User**:
   - Click "Add User" button
   - UserSelectionModal opens showing only users not in any area
   - Search and select a user
   - Confirm selection
   - User is added to the area and list refreshes
3. **Remove User**:
   - Click remove button (minus icon) next to any user
   - Confirmation dialog appears
   - Confirm removal
   - User is removed from area and list refreshes
4. **Search**: Use search bars to filter users in both components

## Role Display

Users are shown with colored badges:

- **Root** (System Administrator): Red badge
- **Admin** (Administrator): Default/blue badge

## Error Handling

- Toast notifications for success/error states
- Loading states during API calls
- Proper error messages for failed operations
- Graceful handling of missing data

## Integration

The AreaUserBlock is already integrated into the Area Detail Page as a tab labeled "Người dùng" (Users).
