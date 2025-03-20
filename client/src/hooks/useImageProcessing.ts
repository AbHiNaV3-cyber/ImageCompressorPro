import { useState } from 'react';
import { type CompressionSettings, type ImageInfo } from '@shared/schema';
import { getFileFormat } from '@/lib/imageHelpers';
import imageCompression from 'browser-image-compression';

export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(null);
  
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    compressionLevel: 80,
    outputFormat: 'jpeg',
    resize: false,
    maintainAspectRatio: true
  });

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Get original image dimensions
      const img = new Image();
      const imgPromise = new Promise<{ width: number, height: number }>((resolve) => {
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
      });
      
      const originalObjectUrl = URL.createObjectURL(file);
      img.src = originalObjectUrl;
      const { width: originalWidth, height: originalHeight } = await imgPromise;
      URL.revokeObjectURL(originalObjectUrl);
      
      // Configure compression options
      const options = {
        maxSizeMB: 10, // No real limit, let quality setting handle this
        maxWidthOrHeight: compressionSettings.resize 
          ? Math.max(compressionSettings.width || 0, compressionSettings.height || 0) 
          : undefined,
        useWebWorker: true,
        fileType: `image/${compressionSettings.outputFormat}`,
        quality: compressionSettings.compressionLevel / 100,
      };
      
      // Perform compression
      const compressedFile = await imageCompression(file, options);
      
      // For resizing that might not be handled by the compression library
      let finalFile = compressedFile;
      
      // Only do manual resizing if the compression library doesn't handle it
      if (compressionSettings.resize && (compressionSettings.width || compressionSettings.height)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Set canvas dimensions
          canvas.width = compressionSettings.width || originalWidth;
          canvas.height = compressionSettings.height || originalHeight;
          
          // Create new image from compressed file
          const resizedImg = new Image();
          const resizedImgPromise = new Promise<void>((resolve) => {
            resizedImg.onload = () => resolve();
          });
          
          const compressedObjectUrl = URL.createObjectURL(compressedFile);
          resizedImg.src = compressedObjectUrl;
          await resizedImgPromise;
          
          // Draw resized image
          ctx.drawImage(resizedImg, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(compressedObjectUrl);
          
          // Convert canvas to Blob
          const blobPromise = new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (blob) => resolve(blob!), 
              `image/${compressionSettings.outputFormat}`, 
              compressionSettings.compressionLevel / 100
            );
          });
          
          const blob = await blobPromise;
          
          // Create file from blob
          finalFile = new File(
            [blob], 
            `resized-${file.name.split('.')[0]}.${compressionSettings.outputFormat}`,
            { type: `image/${compressionSettings.outputFormat}` }
          );
        }
      }
      
      // Create object URL for the compressed image
      const objectUrl = URL.createObjectURL(finalFile);
      setCompressedImageUrl(objectUrl);
      
      // Calculate compression ratio
      const originalSize = file.size;
      const compressedSize = finalFile.size;
      const compressionRatio = 1 - (compressedSize / originalSize);
      
      // Create image info
      const info: ImageInfo = {
        originalName: file.name,
        originalSize,
        originalFormat: getFileFormat(file).toUpperCase(),
        originalWidth,
        originalHeight,
        compressedSize,
        compressedWidth: compressionSettings.resize ? compressionSettings.width : originalWidth,
        compressedHeight: compressionSettings.resize ? compressionSettings.height : originalHeight,
        compressionRatio,
        settings: compressionSettings
      };
      
      setImageInfo(info);
      
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcessing = () => {
    if (compressedImageUrl) {
      URL.revokeObjectURL(compressedImageUrl);
    }
    
    setCompressedImageUrl(null);
    setImageInfo(null);
    setCompressionSettings({
      compressionLevel: 80,
      outputFormat: 'jpeg',
      resize: false,
      maintainAspectRatio: true
    });
  };

  return {
    processImage,
    isProcessing,
    imageInfo,
    compressedImageUrl,
    compressionSettings,
    setCompressionSettings,
    resetProcessing
  };
}
