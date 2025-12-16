import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Download, FileIcon, ExternalLink } from "lucide-react";
import type { Hotspot } from "@/types/hotspots.service.type";
import type { Document } from "@/types/document.type";
import type { Column, RowAction } from "@/types/table.type";
import { getDocumentsByHotspotId } from "@/services/documents.service";
import DocumentUploadModal from "./DocumentUploadModal";
import DocumentManageModal from "./DocumentManageModal";

// Extend Document to have id field for DataTable compatibility
interface DocumentWithId extends Document {
  id: string;
}

const HotspotDocumentBlock = ({
  currentHotspot,
}: {
  currentHotspot: Partial<Hotspot>;
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageModalMode, setManageModalMode] = useState<"edit" | "delete">(
    "edit"
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchDocuments = async () => {
    if (!currentHotspot.hotspot_id) return;

    setLoading(true);
    try {
      const data = await getDocumentsByHotspotId(currentHotspot.hotspot_id);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentHotspot]);

  const handleCreateClick = () => {
    setUploadModalOpen(true);
  };

  const handleEditClick = (document: DocumentWithId) => {
    setSelectedDocument(document);
    setManageModalMode("edit");
    setManageModalOpen(true);
  };

  const handleDeleteClick = (document: DocumentWithId) => {
    setSelectedDocument(document);
    setManageModalMode("delete");
    setManageModalOpen(true);
  };

  const handleDownloadClick = (document: DocumentWithId) => {
    window.open(document.url, "_blank");
  };

  const handleModalSuccess = () => {
    fetchDocuments();
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Transform documents to include id field
  const documentsWithId: DocumentWithId[] = documents.map((document) => ({
    ...document,
    id: document.id,
  }));

  // Apply filters to the data
  const filteredDocuments = documentsWithId.filter((document) => {
    // Apply search filter if exists
    if (filters.search && filters.searchColumn) {
      const searchValue = filters.search.toLowerCase();
      const columnValue = String(
        document[filters.searchColumn as keyof DocumentWithId] || ""
      ).toLowerCase();
      if (!columnValue.includes(searchValue)) {
        return false;
      }
    }

    // Apply column-specific filters
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "search" && key !== "searchColumn" && value) {
        const columnValue = String(
          document[key as keyof DocumentWithId] || ""
        ).toLowerCase();
        const filterValue = String(value).toLowerCase();
        if (!columnValue.includes(filterValue)) {
          return false;
        }
      }
    }

    return true;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="h-4 w-4" />;

    if (fileType.includes("pdf"))
      return <FileIcon className="h-4 w-4 text-red-500" />;
    if (fileType.includes("word"))
      return <FileIcon className="h-4 w-4 text-blue-500" />;
    if (fileType.includes("excel"))
      return <FileIcon className="h-4 w-4 text-green-500" />;
    if (fileType.includes("powerpoint"))
      return <FileIcon className="h-4 w-4 text-orange-500" />;
    if (fileType.includes("image"))
      return <FileIcon className="h-4 w-4 text-purple-500" />;

    return <FileIcon className="h-4 w-4" />;
  };

  const columns: Column<DocumentWithId>[] = [
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      filterable: true,
      render: (value: string, row: DocumentWithId) => (
        <div className="flex items-center space-x-2">
          {getFileIcon(row.file_type)}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "file_name",
      label: "Tên tệp",
      sortable: true,
      filterable: true,
    },
    {
      key: "file_size",
      label: "Kích thước",
      sortable: true,
      render: (value: number) => formatFileSize(value),
    },
    {
      key: "file_type",
      label: "Loại tệp",
      sortable: true,
      filterable: true,
    },
    {
      key: "url",
      label: "Liên kết",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(value, "_blank")}
          className="h-8 px-2"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      ),
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value: string) => (
        <span>{new Date(value).toLocaleDateString("vi-VN")}</span>
      ),
    },
  ];

  const rowActions: RowAction<DocumentWithId>[] = [
    {
      label: "Tải xuống",
      icon: <Download className="h-4 w-4" />,
      onClick: handleDownloadClick,
    },
    {
      label: "Chỉnh sửa",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditClick,
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteClick,
      variant: "destructive",
    },
  ];

  return (
    <div className="space-y-0">
      <Card>
        <CardContent>
          <DataTable
            data={filteredDocuments}
            columns={columns}
            loading={loading}
            rowActions={rowActions}
            rowActionsDisplay="buttons"
            onCreateClick={handleCreateClick}
            createButtonLabel="Thêm tài liệu"
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {currentHotspot.hotspot_id && (
        <>
          <DocumentUploadModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            hotspotId={currentHotspot.hotspot_id}
            onSuccess={handleModalSuccess}
          />

          <DocumentManageModal
            open={manageModalOpen}
            onOpenChange={setManageModalOpen}
            mode={manageModalMode}
            document={selectedDocument}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  );
};

export default HotspotDocumentBlock;
