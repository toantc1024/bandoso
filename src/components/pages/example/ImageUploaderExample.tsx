import { useState } from "react";
import ImageUploaderBlock from "@/components/blocks/ImageUploaderBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ImageUploaderExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    console.log("Files uploaded:", files);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Image Uploader Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploaderBlock
            onFilesUploaded={handleFilesUploaded}
            maxFiles={5}
            multiple={true}
            enableCrop={true}
          />
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploaderExample;
