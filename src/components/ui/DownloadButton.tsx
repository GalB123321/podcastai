import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  className?: string;
}

export function DownloadButton({ url, filename, className }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'podcast-episode.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'transition-colors duration-200',
        className
      )}
    >
      <Download className="h-4 w-4" />
      <span>Download</span>
    </button>
  );
} 