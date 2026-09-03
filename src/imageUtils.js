export function getOptimizedUnsplashImage(
  imageUrl,
  width,
  height,
  quality = 75
) {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl);
    const isUnsplashImage =
      url.hostname === "images.unsplash.com" ||
      url.hostname === "plus.unsplash.com";

    if (!isUnsplashImage) return imageUrl;

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    url.searchParams.set("q", String(quality));

    return url.toString();
  } catch {
    return imageUrl;
  }
}
