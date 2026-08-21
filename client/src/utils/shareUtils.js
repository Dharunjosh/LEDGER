/**
 * Shares text or item details using Web Share API if supported,
 * otherwise falls back to copying to clipboard.
 * 
 * @param {Object} options
 * @param {string} options.title - Title of the item
 * @param {string} options.text - Formatted text to share
 * @param {Function} [options.showToast] - Toast display callback
 */
export async function shareItem({ title, text, showToast }) {
  const content = text || title;
  
  if (navigator.share && navigator.canShare && navigator.canShare({ title, text: content })) {
    try {
      await navigator.share({
        title,
        text: content,
      });
      if (showToast) showToast("Shared successfully!");
      return;
    } catch (err) {
      if (err.name === "AbortError") return; // User cancelled share
      // Fallback to clipboard if share failed
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${title ? title + "\n\n" : ""}${content}`);
    if (showToast) {
      showToast("Copied to clipboard for sharing!");
    }
  } catch (err) {
    if (showToast) {
      showToast("Unable to copy to clipboard", "error");
    }
  }
}
