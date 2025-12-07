// Global type declarations for Box UI Elements SDK

declare global {
  interface Window {
    Box?: {
      Preview: new () => {
        show: (
          fileId: string,
          accessToken: string,
          options: {
            container: string;
            showDownload?: boolean;
            showAnnotations?: boolean;
          }
        ) => void;
        hide: () => void;
        destroy: () => void;
      };
      ContentExplorer: new () => {
        show: (
          folderId: string,
          accessToken: string,
          options: {
            container: string;
            logoUrl?: string;
            canDownload?: boolean;
            canUpload?: boolean;
            canPreview?: boolean;
            canDelete?: boolean;
            canRename?: boolean;
            canCreateNewFolder?: boolean;
            canShare?: boolean;
            canSetShareAccess?: boolean;
            defaultView?: 'files' | 'recents';
            sortBy?: string;
            sortDirection?: 'ASC' | 'DESC';
            canSelect?: boolean;
            selectionType?: 'file' | 'folder' | 'any';
            selection?: 'single' | 'multiple';
            onSelect?: (items: Array<{ id: string; name: string; type: string }>) => void;
            contentPreviewProps?: {
              contentSidebarProps?: {
                detailsSidebarProps?: {
                  hasProperties?: boolean;
                  hasNotices?: boolean;
                  hasAccessStats?: boolean;
                  hasClassification?: boolean;
                  hasRetentionPolicy?: boolean;
                };
                hasActivityFeed?: boolean;
                hasMetadata?: boolean;
                hasSkills?: boolean;
                hasVersions?: boolean;
              };
            };
          }
        ) => void;
        hide: () => void;
      };
    };
  }
}

export {};
