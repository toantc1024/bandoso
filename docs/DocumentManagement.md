# Document Management System

This document management system allows users to upload, manage, and organize documents for hotspots in the VR project.

## Features

### 📁 Document Upload

- **Supported File Types**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images (PNG, JPG, JPEG, GIF, WEBP)
- **File Size Limit**: 10MB per file
- **Drag & Drop Support**: Easy file selection with drag and drop interface
- **File Preview**: Shows file name, size, and type before upload

### 📊 Document Management

- **Data Table View**: Organized display of all documents with sorting and filtering
- **Document Details**: Shows title, file name, file size, file type, and creation date
- **File Type Icons**: Visual indicators for different file types
- **Search & Filter**: Find documents quickly using various criteria

### ⚡ Actions

- **Download/View**: Open documents in a new tab
- **Edit**: Update document titles
- **Delete**: Remove documents with confirmation
- **Bulk Operations**: Select multiple documents for bulk actions

## Document Structure

Each document follows this structure:

```typescript
{
  url: string; // Public URL to access the document
  title: string; // User-defined document title
}
```

## Components

### `HotspotDocumentBlock`

Main component that displays the document management interface for a specific hotspot.

**Props:**

- `currentHotspot: Partial<Hotspot>` - The hotspot object containing the hotspot_id

### `DocumentUploadModal`

Modal component for uploading new documents.

**Props:**

- `open: boolean` - Controls modal visibility
- `onOpenChange: (open: boolean) => void` - Handle modal state changes
- `hotspotId: number` - ID of the hotspot to associate documents with
- `onSuccess?: (document: Document) => void` - Callback when upload succeeds

### `DocumentManageModal`

Modal component for editing or deleting documents.

**Props:**

- `open: boolean` - Controls modal visibility
- `onOpenChange: (open: boolean) => void` - Handle modal state changes
- `mode: "edit" | "delete"` - Operation mode
- `document: Document | null` - Document to edit/delete
- `onSuccess?: () => void` - Callback when operation succeeds

## Services

### `documents.service.ts`

Provides CRUD operations for documents:

- `uploadDocument(documentData, hotspotId)` - Upload a new document
- `getDocumentsByHotspotId(hotspotId)` - Fetch all documents for a hotspot
- `updateDocument(documentId, updates)` - Update document information
- `deleteDocument(documentId)` - Delete a single document
- `bulkDeleteDocuments(documentIds)` - Delete multiple documents

## Usage Example

```tsx
import HotspotDocumentBlock from "@/components/blocks/HotspotDocumentBlock";
import type { Hotspot } from "@/types/hotspots.service.type";

const MyComponent = () => {
  const hotspot: Partial<Hotspot> = {
    hotspot_id: 1,
    title: "My Hotspot",
  };

  return <HotspotDocumentBlock currentHotspot={hotspot} />;
};
```

## Storage Configuration

Documents are stored in Supabase Storage with the following structure:

- **Bucket**: `BUCKET_NAME` (from environment variables)
- **Folder Structure**: `DOCUMENTS_FOLDER_NAME/`
- **File Naming**: `{timestamp}_{original_filename}`

## Database Schema

Documents are stored as a JSON array in the `hotspots` table:

- **Table**: `hotspots`
- **Column**: `documents` (JSONB array)
- **Structure**: `[{ url: string, title: string }, ...]`

Each document in the array contains:

- `url` (string) - Public URL to access the document
- `title` (string) - User-defined document title

The system automatically handles:

- Adding new documents to the array
- Updating existing documents by index
- Removing documents from the array
- Bulk operations across multiple documents

## Security Considerations

- File uploads are limited to 10MB
- Only specific file types are allowed
- Files are stored in a public bucket but with unique names to prevent guessing
- Document access is controlled through the application interface

## Future Enhancements

- [ ] File versioning
- [ ] Document categories/tags
- [ ] Thumbnail generation for images
- [ ] Full-text search within documents
- [ ] Document sharing with external users
- [ ] Document approval workflow
