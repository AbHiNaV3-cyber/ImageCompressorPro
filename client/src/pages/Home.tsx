import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ProcessingControls from "@/components/ProcessingControls";
import ComparisonSlider from "@/components/ComparisonSlider";
import ResultsPanel from "@/components/ResultsPanel";
import { type ImageInfo, type CompressionSettings } from "@shared/schema";
import { useImageProcessing } from "@/hooks/useImageProcessing";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"upload" | "process" | "results">("upload");
  
  const {
    processImage,
    isProcessing,
    imageInfo,
    compressedImageUrl,
    compressionSettings,
    setCompressionSettings,
    resetProcessing,
    isSaving
  } = useImageProcessing();

  const handleImageUpload = (file: File) => {
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setUploadedImage(file);
    setOriginalImageUrl(objectUrl);
    setCurrentView("process");
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) return;
    
    await processImage(uploadedImage);
    setCurrentView("results");
  };

  const handleCompressNewImage = () => {
    // Clean up object URLs
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (compressedImageUrl) URL.revokeObjectURL(compressedImageUrl);
    
    // Reset state
    setUploadedImage(null);
    setOriginalImageUrl(null);
    resetProcessing();
    setCurrentView("upload");
  };

  const handleTryDifferentSettings = () => {
    setCurrentView("process");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Image</span>
            <span className="text-primary">Shrink</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </h1>
          <p className="text-gray-600 mt-2">Compress and resize your images quickly and efficiently</p>
        </header>

        {/* Main Application */}
        <main className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Application Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="px-6 py-4 text-primary border-b-2 border-primary font-medium text-sm">
                Compress & Resize
              </button>
              <button className="px-6 py-4 text-gray-500 hover:text-gray-700 font-medium text-sm">
                Batch Process
              </button>
              <button className="px-6 py-4 text-gray-500 hover:text-gray-700 font-medium text-sm">
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Upload Area */}
            {currentView === "upload" && (
              <ImageUploader onImageUpload={handleImageUpload} />
            )}

            {/* Processing Area */}
            {currentView === "process" && uploadedImage && originalImageUrl && (
              <ProcessingControls 
                previewImage={originalImageUrl}
                imageFile={uploadedImage}
                onProcess={handleProcessImage} 
                onCancel={handleCompressNewImage}
                isProcessing={isProcessing}
                compressionSettings={compressionSettings}
                setCompressionSettings={setCompressionSettings}
              />
            )}

            {/* Results Area */}
            {currentView === "results" && compressedImageUrl && originalImageUrl && imageInfo && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Before & After Comparison</h3>
                  <ComparisonSlider 
                    beforeImage={originalImageUrl} 
                    afterImage={compressedImageUrl} 
                  />
                </div>

                <ResultsPanel
                  imageInfo={imageInfo}
                  compressedImageUrl={compressedImageUrl}
                  onTryDifferentSettings={handleTryDifferentSettings}
                  onCompressNewImage={handleCompressNewImage}
                  isSaving={isSaving}
                />
              </div>
            )}
          </div>
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ImageShrink - Image Compression Tool</p>
          <p className="mt-1">All compression is done client-side. Your images are never uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
}
