import { useState, useEffect } from 'react';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Input 
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getFileFormat, formatFileSize } from '@/lib/imageHelpers';
import { type CompressionSettings } from '@shared/schema';

interface ProcessingControlsProps {
  previewImage: string;
  imageFile: File;
  isProcessing: boolean;
  compressionSettings: CompressionSettings;
  setCompressionSettings: (settings: CompressionSettings) => void;
  onProcess: () => void;
  onCancel: () => void;
}

export default function ProcessingControls({
  previewImage,
  imageFile,
  isProcessing,
  compressionSettings,
  setCompressionSettings,
  onProcess,
  onCancel
}: ProcessingControlsProps) {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // Get image dimensions when preview image is loaded
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      
      // Set initial width/height if resize is enabled
      if (compressionSettings.resize && !compressionSettings.width && !compressionSettings.height) {
        setCompressionSettings({
          ...compressionSettings,
          width: img.width,
          height: img.height
        });
      }
    };
    img.src = previewImage;
  }, [previewImage, compressionSettings, setCompressionSettings]);

  // Update dimensions while maintaining aspect ratio
  const updateDimensions = (dimension: 'width' | 'height', value: number) => {
    if (compressionSettings.maintainAspectRatio) {
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      
      if (dimension === 'width') {
        const height = Math.round(value / aspectRatio);
        setCompressionSettings({
          ...compressionSettings,
          width: value,
          height
        });
      } else {
        const width = Math.round(value * aspectRatio);
        setCompressionSettings({
          ...compressionSettings,
          width,
          height: value
        });
      }
    } else {
      setCompressionSettings({
        ...compressionSettings,
        [dimension]: value
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Preview Panel */}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
        <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ minHeight: '300px' }}>
          {/* Preview image container */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[400px] mx-auto"
          />
          
          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="animate-spin h-10 w-10 mx-auto text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium">Processing image...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Image details */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="text-gray-900 font-medium ml-1">{getFileFormat(imageFile)}</span>
          </div>
          <div>
            <span className="text-gray-500">Dimensions:</span>
            <span className="text-gray-900 font-medium ml-1">
              {imageDimensions.width} × {imageDimensions.height}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <span className="text-gray-900 font-medium ml-1">{formatFileSize(imageFile.size)}</span>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      <div className="lg:w-80">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Compression Settings</h3>
        <Card>
          <CardContent className="space-y-4 pt-6">
            {/* Compression Level */}
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="compressionLevel">Compression Level</Label>
                <span className="text-sm text-primary font-medium">{compressionSettings.compressionLevel}%</span>
              </div>
              <Slider
                id="compressionLevel"
                min={0}
                max={100}
                step={1}
                value={[compressionSettings.compressionLevel]}
                onValueChange={(value) => 
                  setCompressionSettings({ ...compressionSettings, compressionLevel: value[0] })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower Quality</span>
                <span>Higher Quality</span>
              </div>
            </div>
            
            {/* Output Format */}
            <div>
              <Label htmlFor="outputFormat" className="mb-2 block">Output Format</Label>
              <Select
                value={compressionSettings.outputFormat}
                onValueChange={(value: "jpeg" | "png" | "webp") => 
                  setCompressionSettings({ ...compressionSettings, outputFormat: value })
                }
              >
                <SelectTrigger id="outputFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Resize Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="enableResize">Resize Image</Label>
                <Switch
                  id="enableResize"
                  checked={compressionSettings.resize}
                  onCheckedChange={(checked) => 
                    setCompressionSettings({ 
                      ...compressionSettings, 
                      resize: checked,
                      width: checked ? imageDimensions.width : undefined,
                      height: checked ? imageDimensions.height : undefined
                    })
                  }
                />
              </div>
              
              {compressionSettings.resize && (
                <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                  <div className="flex gap-2">
                    <div>
                      <Label htmlFor="customWidth" className="text-xs text-gray-500">Width (px)</Label>
                      <Input
                        id="customWidth"
                        type="number"
                        placeholder="Width"
                        value={compressionSettings.width || ''}
                        onChange={(e) => updateDimensions('width', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customHeight" className="text-xs text-gray-500">Height (px)</Label>
                      <Input
                        id="customHeight"
                        type="number"
                        placeholder="Height"
                        value={compressionSettings.height || ''}
                        onChange={(e) => updateDimensions('height', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keepAspectRatio"
                      checked={compressionSettings.maintainAspectRatio}
                      onCheckedChange={(checked) => 
                        setCompressionSettings({ 
                          ...compressionSettings, 
                          maintainAspectRatio: checked as boolean 
                        })
                      }
                    />
                    <Label htmlFor="keepAspectRatio" className="text-sm text-gray-700">
                      Maintain aspect ratio
                    </Label>
                  </div>
                </div>
              )}
            </div>
            
            {/* Process Button */}
            <Button
              className="w-full"
              onClick={onProcess}
              disabled={isProcessing}
            >
              Compress Image
            </Button>
            
            {/* Cancel Button */}
            <Button
              className="w-full"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
