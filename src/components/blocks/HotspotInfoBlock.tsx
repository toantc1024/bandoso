import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUploaderBlock from "./ImageUploaderBlock";
import PanoramaSelectionModal from "./PanoramaSelectionModal";
import LoadingBlock from "./LoadingBlock";
import { updateHotspot } from "@/services/hotspots.service";
import { uploadFile, retrievePublicUrl } from "@/services/storage.service";
import {
  BUCKET_NAME,
  combinePath,
  HOTSPOTS_FOLDER_NAME,
} from "@/constants/storage.constants";
import type { Hotspot } from "@/types/hotspots.service.type";
import { toast } from "sonner";
import { Loader2, MapPin, Camera, Info, TrashIcon } from "lucide-react";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";
import LatLonPicker from "../ui/lat-lon-picker";

interface HotspotInfoBlockProps {
  currentHotspot: Partial<Hotspot>;
  setCurrentHotspot: React.Dispatch<React.SetStateAction<Partial<Hotspot>>>;
}

const HotspotInfoBlock: React.FC<HotspotInfoBlockProps> = ({
  currentHotspot,
  setCurrentHotspot,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [tempLocation, setTempLocation] = useState<[number, number] | null>(
    null
  );
  const [tempAddress, setTempAddress] = useState<string>("");
  const [showPanoramaModal, setShowPanoramaModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    website: "",
    latitude: "",
    longitude: "",
    click_panorama_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when currentHotspot changes
  useEffect(() => {
    setFormData({
      title: currentHotspot.title || "",
      description: currentHotspot.description || "",
      address: currentHotspot.address || "",
      website: currentHotspot.website || "",
      latitude: currentHotspot.geolocation?.lat?.toString() || "",
      longitude: currentHotspot.geolocation?.lon?.toString() || "",
      click_panorama_id: currentHotspot.click_panorama_id || "",
    });
  }, [currentHotspot]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Website phải là URL hợp lệ";
      }
    }

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = "Vĩ độ phải là một số";
    }

    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = "Kinh độ phải là một số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentHotspot.hotspot_id) {
      toast.error("Không tìm thấy ID hotspot");
      return;
    }

    // Check if any values have actually changed
    const hasChanges =
      formData.title !== (currentHotspot.title || "") ||
      formData.description !== (currentHotspot.description || "") ||
      formData.website !== (currentHotspot.website || "") ||
      formData.address !== (currentHotspot.address || "");
    if (!hasChanges) {
      toast.info("Không có thay đổi nào để cập nhật");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare update data - fix TypeScript error by using undefined instead of null
      const updateData: Partial<Hotspot> = {
        title: formData.title,
        description: formData.description.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        geolocation:
          formData.latitude && formData.longitude
            ? {
              lat: parseFloat(formData.latitude),
              lon: parseFloat(formData.longitude),
            }
            : undefined,
        click_panorama_id: formData.click_panorama_id.trim() || undefined,
      };

      setLoadingStep(0);

      // Handle preview image upload to storage service
      if (previewImageFile) {
        try {
          // Create a unique filename with timestamp
          const timestamp = Date.now();
          const fileExtension = previewImageFile.name.split(".").pop();
          const fileName = `hotspot_${currentHotspot.hotspot_id}_preview_${timestamp}.${fileExtension}`;

          // Check if we have cropped image data, if so convert it to a file
          let fileToUpload = previewImageFile;
          if (croppedImageData) {
            // Convert base64 to blob then to file
            const response = await fetch(croppedImageData);
            const blob = await response.blob();
            fileToUpload = new File([blob], previewImageFile.name, {
              type: previewImageFile.type,
            });
          }

          // Upload file to storage
          await uploadFile(
            fileToUpload,
            BUCKET_NAME,
            combinePath(HOTSPOTS_FOLDER_NAME, currentHotspot.area_id),
            fileName,
            true // upsert = true to overwrite if exists
          );

          // Get the public URL for the uploaded file
          const publicUrl = retrievePublicUrl(
            BUCKET_NAME,
            combinePath(HOTSPOTS_FOLDER_NAME, currentHotspot.area_id),
            fileName
          );

          // Set the public URL as preview_image
          updateData.preview_image = publicUrl;

          toast.success("Ảnh đã được tải lên thành công!");
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Có lỗi xảy ra khi tải lên ảnh");
          return; // Don't proceed if image upload fails
        }
      }

      const updatedHotspot = await updateHotspot(
        currentHotspot.hotspot_id.toString(),
        updateData
      );

      setCurrentHotspot(updatedHotspot);
      toast.success("Cập nhật thông tin hotspot thành công!");
    } catch (error) {
      console.error("Error updating hotspot:", error);
      toast.error("Có lỗi xảy ra khi cập nhật hotspot");
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleReset = () => {
    setFormData({
      title: currentHotspot.title || "",
      description: currentHotspot.description || "",
      address: currentHotspot.address || "",
      website: currentHotspot.website || "",
      latitude: currentHotspot.geolocation?.lat?.toString() || "",
      longitude: currentHotspot.geolocation?.lon?.toString() || "",
      click_panorama_id: currentHotspot.click_panorama_id || "",
    });
    setErrors({});
    setPreviewImageFile(null);
    setCroppedImageData(null);
  };

  const handleRemoveCurrentImage = async () => {
    if (!currentHotspot.hotspot_id) {
      toast.error("Không tìm thấy ID hotspot");
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Partial<Hotspot> = {
        preview_image: undefined,
      };

      const updatedHotspot = await updateHotspot(
        currentHotspot.hotspot_id.toString(),
        updateData
      );

      setCurrentHotspot(updatedHotspot);
      setShowDeleteConfirm(false);
      toast.success("Đã xóa ảnh xem trước!");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Có lỗi xảy ra khi xóa ảnh");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (
    coordinates: [number, number],
    address?: string
  ) => {
    setTempLocation(coordinates);
    setTempAddress(address || "");
  };

  const handleSaveLocation = () => {
    if (tempLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: tempLocation[1].toString(),
        longitude: tempLocation[0].toString(),
        address: tempAddress || prev.address, // Use temp address if available, otherwise keep current
      }));
      setShowMapDialog(false);
      setTempLocation(null);
      setTempAddress("");
      toast.success("Đã chọn vị trí và địa chỉ trên bản đồ!");
    }
  };

  const handlePanoramaSelect = (panoramaId: string) => {
    setFormData((prev) => ({
      ...prev,
      click_panorama_id: panoramaId,
    }));
    if (panoramaId) {
      toast.success("Đã chọn panorama thành công!");
    } else {
      toast.success("Đã xóa lựa chọn panorama!");
    }
  };

  // Define progress messages based on whether we have an image to upload
  const getProgressMessages = () => {
    const messages = ["Đang chuẩn bị dữ liệu..."];
    if (previewImageFile) {
      messages.push("Đang tải lên ảnh...");
    }
    messages.push("Đang cập nhật thông tin hotspot...");
    return messages;
  };

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {isLoading && (
        <LoadingBlock
          message="Đang cập nhật hotspot..."
          preventBrowserClose={true}
          progressMessages={getProgressMessages()}
          currentStep={loadingStep}
          variant="circle"
        />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông tin Địa điểm</CardTitle>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Đặt lại
              </Button>
              <Button type="submit" form="hotspot-form" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="hotspot-form" onSubmit={onSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Thông tin chung</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nhập tiêu đề hotspot"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.website && (
                  <p className="text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả chi tiết về hotspot"
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Panorama ID section */}
            <div className="grid gap-3 pt-4">
              <Label htmlFor="click_panorama_id">Panorama ID chính của địa điểm</Label>
              <div className="flex space-x-2">
                <Input
                  id="click_panorama_id"
                  name="click_panorama_id"
                  placeholder="ID của ảnh 360 sẽ mở khi ấn vào địa điểm này"
                  value={formData.click_panorama_id}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPanoramaModal(true)}
                  disabled={isLoading || !currentHotspot.hotspot_id}
                >
                  Chọn Panorama chính
                </Button>
              </div>
              {errors.click_panorama_id && (
                <p className="text-sm text-red-600">
                  {errors.click_panorama_id}
                </p>
              )}
              {formData.click_panorama_id && (
                <p className="text-sm text-green-600">
                  ✓ Đã chọn panorama: {formData.click_panorama_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vị trí địa lý - Left column */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Vị trí địa lý</h3>
                </div>

                {/* Address field */}
                <div className="grid gap-3">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ hoặc chọn từ bản đồ"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="10.7769"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.latitude && (
                      <p className="text-sm text-red-600">{errors.latitude}</p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="106.7009"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.longitude && (
                      <p className="text-sm text-red-600">{errors.longitude}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Set current location as temp location if it exists
                    if (formData.latitude && formData.longitude) {
                      setTempLocation([
                        parseFloat(formData.longitude),
                        parseFloat(formData.latitude),
                      ]);
                      setTempAddress(formData.address);
                    } else {
                      setTempLocation(null);
                      setTempAddress("");
                    }
                    setShowMapDialog(true);
                  }}
                  disabled={isLoading}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Chọn vị trí trên bản đồ
                </Button>
              </div>

              {/* Ảnh xem trước - Right column */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Ảnh xem trước</h3>
                </div>

                {/* Show current preview image if exists */}
                {currentHotspot.preview_image && !previewImageFile && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-start gap-2">
                      <Label>Ảnh hiện tại</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isLoading}
                      >
                        <TrashIcon className="mr-1 h-4 w-4" />
                        <span>Xóa ảnh</span>
                      </Button>
                    </div>
                    <div className="max-w-xs">
                      <div
                        className="relative group aspect-4/3 overflow-hidden rounded-lg border bg-gray-100"
                        style={{ maxHeight: "512px" }}
                      >
                        <ImageZoom>
                          <img
                            src={currentHotspot.preview_image}
                            alt="Current preview"
                            className="w-full h-full object-cover"
                          />
                        </ImageZoom>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show uploader when no current image OR when user has selected a new file */}
                {(!currentHotspot.preview_image || previewImageFile) && (
                  <div className="space-y-2">
                    <Label>
                      {currentHotspot.preview_image ? "Ảnh mới" : "Tải lên ảnh"}
                    </Label>
                    <ImageUploaderBlock
                      file={previewImageFile}
                      setFile={setPreviewImageFile}
                      multiple={false}
                      enableCrop={true}
                      onCroppedImageChange={setCroppedImageData}
                      placeholder={
                        currentHotspot.preview_image
                          ? "Tải lên ảnh mới để thay thế"
                          : "Tải lên ảnh xem trước cho địa điểm"
                      }
                    />
                  </div>
                )}

                {previewImageFile && (
                  <p className="text-sm text-blue-600">
                    ℹ️{" "}
                    {croppedImageData
                      ? "Ảnh đã cắt sẽ được tải lên"
                      : "Ảnh sẽ được tải lên"}{" "}
                    khi bạn nhấn "Cập nhật"
                    {!croppedImageData && " (Nhấp vào ảnh để cắt)"}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Map Location Picker Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="sm:max-w-[80vw] p-6 sm:max-h-screen">
          <DialogHeader>
            <DialogTitle>Chọn kinh độ/vĩ độ</DialogTitle>
            <DialogDescription>
              Nhấp vào bản đồ để chọn vị trí cho hotspot. Nhấn "Lưu" để xác nhận
              vị trí đã chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[600px] rounded-md w-full space-y-4">
            <LatLonPicker
              initialCenter={[
                formData.longitude
                  ? parseFloat(formData.longitude)
                  : 106.741961,
                formData.latitude ? parseFloat(formData.latitude) : 10.849256,
              ]}
              initialMarker={
                formData.latitude && formData.longitude
                  ? [
                    parseFloat(formData.longitude),
                    parseFloat(formData.latitude),
                  ]
                  : undefined
              }
              initialZoom={14}
              onLocationSelect={handleLocationSelect}
              className="h-full w-full"
            />
            {tempLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 w-xl">
                <p className="text-sm font-medium text-blue-900">
                  Bạn đã chọn: Vĩ độ {tempLocation[1].toFixed(6)}, Kinh độ{" "}
                  {tempLocation[0].toFixed(6)}
                </p>
                {tempAddress && (
                  <p className="text-xs text-blue-700 mt-1">
                    Địa chỉ: {tempAddress}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSaveLocation}
              disabled={!tempLocation}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
        {/* <DialogContent className="w-full h-auto min-h-[50vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Chọn vị trí trên bản đồ</DialogTitle>
            <DialogDescription>
              Nhấp vào bản đồ để chọn vị trí cho hotspot
            </DialogDescription>
          </DialogHeader>
          <div className="h-full w-full p-6 pt-2">
            <div className="h-full w-full rounded-lg overflow-hidden">
           
            </div>
          </div>
        </DialogContent> */}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa ảnh</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ảnh xem trước này không? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCurrentImage}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <TrashIcon className="mr-2 h-4 w-4" />
              Xóa ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panorama Selection Modal */}
      <PanoramaSelectionModal
        isOpen={showPanoramaModal}
        onClose={() => setShowPanoramaModal(false)}
        onSelect={handlePanoramaSelect}
        hotspotId={currentHotspot.hotspot_id || ""}
        currentPanoramaId={formData.click_panorama_id}
      />
    </div>
  );
};

export default HotspotInfoBlock;
