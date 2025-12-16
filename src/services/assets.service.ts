import { uploadFile, retrievePublicUrl } from "./storage.service";
import type { Asset } from "@/types/asset.type";
import { getHotspotById, updateHotspot } from "./hotspots.service";
import {
  BUCKET_NAME,
  combinePath,
  ASSETS_FOLDER_NAME,
} from "@/constants/storage.constants";

export interface AssetUpload {
  title: string;
  description: string;
  file: File;
  panorama_id?: string;
}

export const uploadAsset = async (
  assetData: AssetUpload,
  hotspotId: string
): Promise<Asset> => {
  try {
    const { file, title, description, panorama_id } = assetData;
    const hotspot = await getHotspotById(hotspotId);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `asset_${timestamp}.${fileExtension}`;
    const folder = combinePath(
      ASSETS_FOLDER_NAME,
      hotspot?.area_id?.toString() || "general"
    );
    // Upload file to storage
    await uploadFile(file, BUCKET_NAME, folder, fileName, true);

    // Get public URL
    const imageUrl = retrievePublicUrl(BUCKET_NAME, folder, fileName);

    // Create asset object
    const newAsset: Asset = {
      asset_id: `asset_${timestamp}`,
      title,
      description,
      image_url: imageUrl,
      panorama_id: panorama_id || undefined,
    };

    // Get current hotspot
    if (!hotspot) {
      throw new Error("Hotspot not found");
    }

    // Update hotspot assets array
    const currentAssets = hotspot.assets || [];
    const updatedAssets = [...currentAssets, newAsset];

    await updateHotspot(hotspotId, { assets: updatedAssets });

    return newAsset;
  } catch (error) {
    throw new Error("Failed to upload asset: " + (error as Error).message);
  }
};

export const getAssetsByHotspotId = async (
  hotspotId: string
): Promise<Asset[]> => {
  try {
    const hotspot = await getHotspotById(hotspotId);
    if (!hotspot || !hotspot.assets) {
      return [];
    }

    return hotspot.assets;
  } catch (error) {
    throw new Error("Failed to get assets: " + (error as Error).message);
  }
};

export const updateAsset = async (
  assetId: string,
  hotspotId: string,
  updates: Partial<Asset>
): Promise<Asset> => {
  try {
    const hotspot = await getHotspotById(hotspotId);
    if (!hotspot || !hotspot.assets) {
      throw new Error("Hotspot or assets not found");
    }

    const assetIndex = hotspot.assets.findIndex(
      (asset) => asset.asset_id === assetId
    );
    if (assetIndex === -1) {
      throw new Error("Asset not found");
    }

    // Update the asset
    const updatedAsset = { ...hotspot.assets[assetIndex], ...updates };
    const updatedAssets = [...hotspot.assets];
    updatedAssets[assetIndex] = updatedAsset;

    await updateHotspot(hotspotId, { assets: updatedAssets });

    return updatedAsset;
  } catch (error) {
    throw new Error("Failed to update asset: " + (error as Error).message);
  }
};

export const deleteAsset = async (
  assetId: string,
  hotspotId: string
): Promise<void> => {
  try {
    const hotspot = await getHotspotById(hotspotId);
    if (!hotspot || !hotspot.assets) {
      throw new Error("Hotspot or assets not found");
    }

    const updatedAssets = hotspot.assets.filter(
      (asset) => asset.asset_id !== assetId
    );

    await updateHotspot(hotspotId, { assets: updatedAssets });
  } catch (error) {
    throw new Error("Failed to delete asset: " + (error as Error).message);
  }
};
