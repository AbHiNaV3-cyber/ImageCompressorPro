/**
 * Formats file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Returns the file format of an image file
 */
export function getFileFormat(file: File): string {
  // Check mime type first
  if (file.type) {
    const mimeTypeParts = file.type.split('/');
    if (mimeTypeParts.length === 2 && mimeTypeParts[0] === 'image') {
      return mimeTypeParts[1];
    }
  }
  
  // Fall back to file extension
  const name = file.name;
  const extension = name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'gif':
      return 'gif';
    case 'svg':
      return 'svg';
    default:
      return extension || 'unknown';
  }
}

/**
 * Creates a blob URL from a data URL
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Creates a filename with format suffix
 */
export function createFilename(originalName: string, format: string): string {
  const nameParts = originalName.split('.');
  nameParts.pop(); // Remove the extension
  return `${nameParts.join('.')}.${format}`;
}
