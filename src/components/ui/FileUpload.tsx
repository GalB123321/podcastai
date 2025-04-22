import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  showPreviews?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUpload({
  onFileSelect,
  accept = '*/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  showPreviews = true,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file validation
  const validateFiles = (fileList: FileList | File[]): FileWithPreview[] => {
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    // Convert FileList to array
    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`);
        return;
      }

      // Check file type
      if (!file.type.match(accept.replace('*', '.*'))) {
        errors.push(`${file.name} has an invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    // Check number of files
    if (validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      validFiles.splice(maxFiles);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    return validFiles;
  };

  // Create preview URLs for images
  const createPreviews = async (validFiles: FileWithPreview[]) => {
    const filesWithPreviews = await Promise.all(
      validFiles.map(async (file) => {
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          return { ...file, preview };
        }
        return file;
      })
    );
    return filesWithPreviews;
  };

  // Handle file selection
  const handleFiles = async (fileList: FileList | File[]) => {
    const validFiles = validateFiles(fileList);
    const filesWithPreviews = await createPreviews(validFiles);
    
    setFiles(multiple ? [...files, ...filesWithPreviews] : filesWithPreviews);
    onFileSelect(validFiles);
  };

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>, isDraggingState: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isDraggingState);
  };

  // Handle drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  };

  // Handle file input change
  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (fileToRemove: FileWithPreview) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    setFiles(newFiles);
    onFileSelect(newFiles);

    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  // Cleanup previews on unmount
  const cleanup = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          relative
          border-2 border-dashed
          rounded-lg
          p-6
          text-center
          transition-colors duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />

        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your files here, or{' '}
          <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
            browse
          </span>
        </p>
        
        <p className="mt-1 text-xs text-gray-500">
          {multiple
            ? `Up to ${maxFiles} files, max ${maxSize / 1024 / 1024}MB each`
            : `Max file size ${maxSize / 1024 / 1024}MB`
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* File Previews */}
      {showPreviews && files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="
                flex items-center
                p-2
                bg-gray-50
                rounded-lg
                border border-gray-200
              "
            >
              {/* Preview Image */}
              {file.preview && (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              )}

              {/* File Info */}
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)}KB
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file);
                }}
                className="
                  p-1
                  text-gray-400 hover:text-gray-500
                  rounded-full
                  hover:bg-gray-100
                "
                aria-label={`Remove ${file.name}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 