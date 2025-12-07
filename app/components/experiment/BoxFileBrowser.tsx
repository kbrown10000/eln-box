'use client';

import BoxHub from '@/app/components/box/BoxHub';

interface BoxFileBrowserProps {
  folderId: string;
  folderPath: string[];
  onFileSelect?: (fileId: string, fileName: string) => void;
}

/**
 * BoxFileBrowser
 * 
 * Replaces the custom file list with the native Box Content Explorer (via BoxHub).
 * This provides a richer, more robust "Box Experience" including drag-and-drop,
 * previews, and search.
 */
export default function BoxFileBrowser({
  folderId,
  folderPath,
  onFileSelect,
}: BoxFileBrowserProps) {
  // Use the last folder name in the path for the header
  const currentFolderName = folderPath[folderPath.length - 1] || 'Experiment Files';

  return (
    <div className="mt-8">
       {/* We use BoxHub directly, which implements the native Box Content Explorer */}
       <BoxHub folderId={folderId} folderName={currentFolderName} onFileSelect={onFileSelect} />
    </div>
  );
}
