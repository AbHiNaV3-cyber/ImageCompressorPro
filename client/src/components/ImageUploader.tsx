import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const dropzoneClasses = `
    w-full h-64 border-2 border-dashed 
    rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer 
    transition-colors duration-300
    ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
    ${isDragReject ? 'border-error bg-error/10' : ''}
  `;

  return (
    <div className="flex flex-col items-center">
      <div {...getRootProps({ className: dropzoneClasses })}>
        <input {...getInputProps()} />
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        
        {isDragReject ? (
          <p className="text-lg text-error font-medium">Unsupported file format</p>
        ) : (
          <>
            <p className="text-lg text-gray-600 font-medium">Drag & drop your image here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <button className="mt-3 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-3">Supports JPG, PNG, and WebP formats</p>
          </>
        )}
      </div>
    </div>
  );
}
