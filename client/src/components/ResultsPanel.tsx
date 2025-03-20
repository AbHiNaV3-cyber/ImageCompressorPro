import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatFileSize } from '@/lib/imageHelpers';
import { ImageInfo } from '@shared/schema';
import { ArrowDown, Settings, FilePlus2 } from 'lucide-react';

interface ResultsPanelProps {
  imageInfo: ImageInfo;
  compressedImageUrl: string;
  onTryDifferentSettings: () => void;
  onCompressNewImage: () => void;
}

export default function ResultsPanel({
  imageInfo,
  compressedImageUrl,
  onTryDifferentSettings,
  onCompressNewImage
}: ResultsPanelProps) {
  const sizeReduction = imageInfo.compressionRatio ? Math.round(imageInfo.compressionRatio * 100) : 0;
  
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = compressedImageUrl;
    a.download = `compressed-${imageInfo.originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Statistics */}
      <Card className="flex-1">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compression Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Size Comparison */}
            <div className="col-span-2 md:col-span-1 bg-gray-50 rounded-lg shadow-sm p-4">
              <h4 className="text-sm font-medium text-gray-500">Size Reduction</h4>
              <div className="mt-2 flex items-center">
                <div className="text-2xl font-semibold text-success">{sizeReduction}%</div>
                <ArrowDown className="h-5 w-5 text-success ml-1" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From <span className="font-medium">{formatFileSize(imageInfo.originalSize)}</span> to{' '}
                <span className="font-medium">
                  {imageInfo.compressedSize && formatFileSize(imageInfo.compressedSize)}
                </span>
              </p>
            </div>
            
            {/* Dimensions */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-4">
              <h4 className="text-sm font-medium text-gray-500">Dimensions</h4>
              <div className="mt-2">
                <div className="text-sm font-medium">
                  {imageInfo.compressedWidth && imageInfo.compressedHeight 
                    ? `${imageInfo.compressedWidth} × ${imageInfo.compressedHeight}`
                    : `${imageInfo.originalWidth} × ${imageInfo.originalHeight}`
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {imageInfo.compressedWidth && imageInfo.compressedHeight 
                    && imageInfo.compressedWidth !== imageInfo.originalWidth 
                    ? 'Resized dimensions' 
                    : 'Original dimensions preserved'
                  }
                </p>
              </div>
            </div>
            
            {/* Format */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-4">
              <h4 className="text-sm font-medium text-gray-500">Format</h4>
              <div className="mt-2">
                <div className="text-sm font-medium">{
                  imageInfo.settings?.outputFormat?.toUpperCase() || imageInfo.originalFormat
                }</div>
                <p className="text-xs text-gray-500 mt-1">
                  Quality: <span>{imageInfo.settings?.compressionLevel}%</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Download Options */}
      <Card className="md:w-80">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Download</h3>
          
          <Button 
            className="w-full mb-4"
            onClick={handleDownload}
          >
            <ArrowDown className="h-5 w-5 mr-2" />
            Download Compressed Image
          </Button>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              variant="outline"
              onClick={onTryDifferentSettings}
            >
              <Settings className="h-5 w-5 mr-2" />
              Try Different Settings
            </Button>
            
            <Button 
              className="w-full"
              variant="outline"
              onClick={onCompressNewImage}
            >
              <FilePlus2 className="h-5 w-5 mr-2" />
              Compress New Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
