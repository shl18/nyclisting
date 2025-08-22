/**
 * Formats an image URL
 * @param imageUrl The original image URL
 * @param dimensions Optional dimensions to use (defaults to 800x400)
 * @returns Formatted image URL
 */
export function formatImageUrl(
  imageUrl: string,
  dimensions: { width: number; height: number } = { width: 800, height: 400 }
): string {
  if (imageUrl.includes("zillowstatic.com")) {
    const baseUrl = imageUrl.split("-")[0];
    return `${baseUrl}-se_large_${dimensions.width}_${dimensions.height}.webp`;
  }

  return imageUrl;
}

/**
 * Formats an array of image URLs to match the Zillow format
 * @param imageUrls Array of original image URLs
 * @param dimensions Optional dimensions to use (defaults to 800x400)
 * @returns Array of formatted image URLs
 */
export function formatImageUrls(
  imageUrls: string[],
  dimensions: { width: number; height: number } = { width: 800, height: 400 }
): string[] {
  return imageUrls.map((url) => formatImageUrl(url, dimensions));
}
