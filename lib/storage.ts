import { supabase } from "./supabaseClient";

const BUCKET_NAME = "listing-images";

/**
 * Downloads an image from a URL and returns it as a Blob
 * @param imageUrl The URL of the image to download
 * @returns The image as a Blob
 */
async function downloadImage(imageUrl: string): Promise<Blob> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

/**
 * Uploads an image to Supabase storage
 * @param imageUrl The URL of the image to upload
 * @param listingId The ID of the listing this image belongs to
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToStorage(
  imageUrl: string,
  listingId: string
): Promise<string> {
  try {
    const imageBlob = await downloadImage(imageUrl);

    const fileExtension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
    const fileName = `${listingId}/${Date.now()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageBlob, {
        contentType: imageBlob.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image to storage:", error);
    throw error;
  }
}

/**
 * Uploads multiple images to Supabase storage
 * @param imageUrls Array of image URLs to upload
 * @param listingId The ID of the listing these images belong to
 * @returns Array of public URLs for the uploaded images
 */
export async function uploadImagesToStorage(
  imageUrls: string[],
  listingId: string
): Promise<string[]> {
  try {
    const uploadPromises = imageUrls.map((url) =>
      uploadImageToStorage(url, listingId)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images to storage:", error);
    throw error;
  }
}

/**
 * Deletes an image from Supabase storage
 * @param imageUrl The public URL of the image to delete
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    const path = imageUrl.split(`${BUCKET_NAME}/`)[1];
    if (!path) {
      throw new Error("Invalid image URL");
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting image from storage:", error);
    throw error;
  }
}

/**
 * Deletes multiple images from Supabase storage
 * @param imageUrls Array of public URLs of images to delete
 */
export async function deleteImagesFromStorage(
  imageUrls: string[]
): Promise<void> {
  try {
    const deletePromises = imageUrls.map((url) => deleteImageFromStorage(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting images from storage:", error);
    throw error;
  }
}
