'use client';

import { useState, useEffect, useRef } from 'react';
import '@/lib/box/types-global';
import { useBoxSDK } from './BoxClientProvider';

interface BoxHubProps {
  folderId: string;
  folderName?: string;
}

export default function BoxHub({ folderId, folderName }: BoxHubProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sdkLoaded, error: sdkError } = useBoxSDK();
  const explorerRef = useRef<any>(null);

  useEffect(() => {
    if (sdkError) {
        setError(sdkError);
        setIsLoading(false);
    }
  }, [sdkError]);

  // Initialize explorer when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !window.Box?.ContentExplorer) return;

    const initExplorer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get downscoped token for this folder
        const tokenResponse = await fetch(
          `/api/box/token?folderId=${folderId}&scopes=item_preview,item_download,item_upload,base_explorer,item_delete`
        );
        if (!tokenResponse.ok) {
          const err = await tokenResponse.json();
          throw new Error(err.error || 'Failed to get access token');
        }
        const { accessToken } = await tokenResponse.json();

        // Clean up previous explorer instance
        if (explorerRef.current) {
          explorerRef.current.hide();
        }

        // Initialize new explorer
        const explorer = new window.Box!.ContentExplorer();
        explorerRef.current = explorer;

        explorer.show(folderId, accessToken, {
          container: '#box-explorer-container',
          logoUrl: '', // Could add a custom logo here
          canDownload: true,
          canUpload: true,
          canPreview: true,
          canDelete: true, // Enabled per user request for full experience
          canRename: true,
          canCreateNewFolder: true,
          canShare: false, // Still risky without proper user tokens
          canSetShareAccess: false,
          defaultView: 'files',
          sortBy: 'name',
          sortDirection: 'ASC',
          contentPreviewProps: {
            contentSidebarProps: {
              detailsSidebarProps: {
                hasProperties: true,
                hasNotices: true,
                hasAccessStats: true,
                hasClassification: true,
                hasRetentionPolicy: true,
              },
              hasActivityFeed: true,
              hasMetadata: true,
              hasSkills: true,
              hasVersions: true,
            }
          }
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error('Explorer initialization error:', err);
        setError(err.message || 'Failed to load Box Hub');
        setIsLoading(false);
      }
    };

    initExplorer();

    return () => {
      if (explorerRef.current) {
        explorerRef.current.hide();
        explorerRef.current = null;
      }
    };
  }, [sdkLoaded, folderId]);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
        </svg>
        <div>
          <h2 className="font-semibold">Box Hub</h2>
          {folderName && (
            <p className="text-blue-100 text-sm">{folderName}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative" style={{ minHeight: '500px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-600">Loading Box Hub...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center px-6">
              <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-gray-900 font-medium mb-2">Failed to load Box Hub</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Box Explorer Container */}
        <div
          id="box-explorer-container"
          className="box-explorer-override" 
          style={{
            height: '600px',
            // Keep it in DOM but hidden if loading/error to avoid flash
            visibility: isLoading || error ? 'hidden' : 'visible', 
          }}
        />
      </div>
    </div>
  );
}
