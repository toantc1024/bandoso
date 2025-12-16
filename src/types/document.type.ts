export interface Document {
  id: string;
  url: string;
  title: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  hotspot_id?: number;
  created_at?: string;
  updated_at?: string;
  chunked_ids?: string[];
}

export interface DocumentUpload {
  title: string;
  file: File;
}
export interface AddChatDocumentRequest {
  page_content: string | undefined;
  metadata: Record<string, any>;
}

export interface AddChatFileDocumentRequest {
  file_url: string;
  metadata: Record<string, any>;
}
