import { uploadFile, retrievePublicUrl } from "./storage.service";
import type {
  AddChatDocumentRequest,
  AddChatFileDocumentRequest,
  Document as DocumentType,
  DocumentUpload,
} from "@/types/document.type";
import { getHotspotById, updateHotspot } from "./hotspots.service";
import {
  BUCKET_NAME,
  combinePath,
  DOCUMENTS_FOLDER_NAME,
} from "@/constants/storage.constants";
import { getApi } from "@/lib/api";
import type { GetVectorRequest } from "./base.service";

export const uploadDocument = async (
  documentData: DocumentUpload,
  hotspotId: number,
  isAddToChatContext = false
): Promise<DocumentType> => {
  try {
    const { file, title } = documentData;
    const hotspot = await getHotspotById(hotspotId.toString());

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${file.name}`;
    const folder = combinePath(DOCUMENTS_FOLDER_NAME, hotspot?.area_id);

    // Upload file to storage
    await uploadFile(file, BUCKET_NAME, folder, fileName, true);

    // Get public URL
    const url = retrievePublicUrl(BUCKET_NAME, folder, fileName);

    // Create document object

    let documentId = `doc_${timestamp}`;
    const newDocument: DocumentType = {
      id: `doc_${timestamp}`,
      url,
      title,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
      hotspot_id: hotspotId,
      created_at: new Date().toISOString(),
    };

    if (isAddToChatContext) {
      let response = await addChatFileDocument({
        file_url: url,
        metadata: {
          hotspot_id: hotspotId,
          document_id: documentId,
          file_name: fileName,
        },
      });
      newDocument["chunked_ids"] = response.ids;
    }

    // Get current hotspot
    if (!hotspot) {
      throw new Error("Hotspot not found");
    }

    // Update hotspot documents array
    const currentDocuments = hotspot.documents || [];
    const updatedDocuments = [...currentDocuments, newDocument];

    await updateHotspot(hotspotId.toString(), { documents: updatedDocuments });

    return newDocument;
  } catch (error) {
    throw new Error("Failed to upload document: " + (error as Error).message);
  }
};

export const getDocumentsByHotspotId = async (
  hotspotId: number
): Promise<DocumentType[]> => {
  try {
    const hotspot = await getHotspotById(hotspotId.toString());
    if (!hotspot || !hotspot.documents) {
      return [];
    }

    return hotspot.documents.map((doc, index) => ({
      id: `doc_${hotspotId}_${index}`,
      url: doc.url,
      title: doc.title,
      hotspot_id: hotspotId,
      created_at: hotspot.created_at || undefined,
      file_name: doc.url.split("/").pop() || "unknown",
      file_type: getFileTypeFromUrl(doc.url),
    }));
  } catch (error) {
    throw new Error("Failed to get documents: " + (error as Error).message);
  }
};

export const updateDocument = async (
  documentId: string,
  updates: Partial<DocumentType>
): Promise<DocumentType> => {
  try {
    // Extract hotspot ID and document index from documentId
    const [, hotspotIdStr, indexStr] = documentId.split("_");
    const hotspotId = parseInt(hotspotIdStr);
    const documentIndex = parseInt(indexStr);

    const hotspot = await getHotspotById(hotspotId.toString());
    if (!hotspot || !hotspot.documents) {
      throw new Error("Hotspot or documents not found");
    }

    // Update the specific document in the array
    const updatedDocuments = [...hotspot.documents];
    if (updatedDocuments[documentIndex]) {
      updatedDocuments[documentIndex] = {
        ...updatedDocuments[documentIndex],
        title: updates.title || updatedDocuments[documentIndex].title,
      };

      await updateHotspot(hotspotId.toString(), {
        documents: updatedDocuments,
      });

      return {
        id: documentId,
        url: updatedDocuments[documentIndex].url,
        title: updatedDocuments[documentIndex].title,
        hotspot_id: hotspotId,
        created_at: hotspot.created_at || undefined,
        file_name:
          updatedDocuments[documentIndex].url.split("/").pop() || "unknown",
        file_type: getFileTypeFromUrl(updatedDocuments[documentIndex].url),
      };
    }

    throw new Error("Document not found");
  } catch (error) {
    throw new Error("Failed to update document: " + (error as Error).message);
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    // Extract hotspot ID and document index from documentId
    const [, hotspotIdStr, indexStr] = documentId.split("_");
    const hotspotId = parseInt(hotspotIdStr);
    const documentIndex = parseInt(indexStr);

    const hotspot = await getHotspotById(hotspotId.toString());
    if (!hotspot || !hotspot.documents) {
      throw new Error("Hotspot or documents not found");
    }

    // Remove the document from the array
    let chunked_ids = hotspot.documents[documentIndex].chunked_ids;
    await deleteChatDocument(chunked_ids || []);
    const updatedDocuments = hotspot.documents.filter(
      (_, index) => index !== documentIndex
    );
    await updateHotspot(hotspotId.toString(), { documents: updatedDocuments });
  } catch (error) {
    throw new Error("Failed to delete document: " + (error as Error).message);
  }
};

export const bulkDeleteDocuments = async (
  documentIds: string[]
): Promise<void> => {
  try {
    // Group by hotspot ID
    const documentsByHotspot: Record<string, number[]> = {};

    documentIds.forEach((documentId) => {
      const [, hotspotIdStr, indexStr] = documentId.split("_");
      if (!documentsByHotspot[hotspotIdStr]) {
        documentsByHotspot[hotspotIdStr] = [];
      }
      documentsByHotspot[hotspotIdStr].push(parseInt(indexStr));
    });

    // Update each hotspot
    for (const [hotspotIdStr, indices] of Object.entries(documentsByHotspot)) {
      const hotspot = await getHotspotById(hotspotIdStr);
      if (hotspot && hotspot.documents) {
        // Sort indices in descending order to remove from end first
        const sortedIndices = indices.sort((a, b) => b - a);
        let updatedDocuments = [...hotspot.documents];

        sortedIndices.forEach((index) => {
          updatedDocuments.splice(index, 1);
        });

        await updateHotspot(hotspotIdStr, { documents: updatedDocuments });
      }
    }
  } catch (error) {
    throw new Error(
      "Failed to bulk delete documents: " + (error as Error).message
    );
  }
};

// Helper function to determine file type from URL
const getFileTypeFromUrl = (url: string): string => {
  const extension = url.split(".").pop()?.toLowerCase();
  if (!extension) return "unknown";

  const typeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };

  return typeMap[extension] || "unknown";
};

export const addChatDocument = async (request: AddChatDocumentRequest) => {
  let data = await getApi().post(`/documents/`, request);
  if (data.status !== 200) {
    throw new Error("Failed to add chat document: " + data.statusText);
  }
  return data.data;
};

export const addChatFileDocument = async (
  request: AddChatFileDocumentRequest
) => {
  let data = await getApi().post(`/documents/file`, request);
  if (data.status !== 200) {
    throw new Error("Failed to add chat file document: " + data.statusText);
  }
  return data.data;
};

export const deleteChatDocument = async (ids: string[]) => {
  let data = await getApi().delete(`/documents/delete`, {
    data: { ids },
  });
  if (data.status !== 200) {
    throw new Error("Failed to delete chat document: " + data.statusText);
  }
  return data.data;
};

export const getChatDocument = async (request: GetVectorRequest) => {
  let data = await getApi().post(`/documents/query`, request);
  if (data.status !== 200) {
    throw new Error("Failed to get chat document: " + data.statusText);
  }
  return data.data;
};
