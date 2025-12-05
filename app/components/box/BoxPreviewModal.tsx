'use client';

import { useState, useEffect, useRef } from 'react';
import '@/lib/box/types-global';

interface BoxPreviewModalProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BoxPreviewModal({
  fileId,
  fileName,
  isOpen,
  onClose,
}: BoxPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const previewRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Box Preview SDK
  useEffect(() => {
    if (!isOpen) return;

    // Check if already loaded
    if (window.Box?.Preview) {
      setSdkLoaded(true);
      return;
    }

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn01.boxcdn.net/platform/preview/2.94.0/en-US/preview.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn01.boxcdn.net/platform/preview/2.94.0/en-US/preview.js';
    script.async = true;
    script.onload = () => {
      setSdkLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load Box Preview SDK');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script and css if component unmounts before load
    };
  }, [isOpen]);

  // Initialize preview when SDK is loaded
  useEffect(() => {
    if (!isOpen || !sdkLoaded || !window.Box?.Preview) return;

    const initPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get downscoped token for this file
        const tokenResponse = await fetch(`/api/box/token?fileId=${fileId}`);
        if (!tokenResponse.ok) {
          const err = await tokenResponse.json();
          throw new Error(err.error || 'Failed to get access token');
        }
        const { accessToken } = await tokenResponse.json();

        // Clean up previous preview instance
        if (previewRef.current) {
          previewRef.current.destroy();
        }

        // Initialize new preview
        const preview = new window.Box!.Preview();
        previewRef.current = preview;

        preview.show(fileId, accessToken, {
          container: '#box-preview-container',
          showDownload: true,
          showAnnotations: false,
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error('Preview initialization error:', err);
        setError(err.message || 'Failed to load preview');
        setIsLoading(false);
      }
    };

    initPreview();

    return () => {
      if (previewRef.current) {
        previewRef.current.destroy();
        previewRef.current = null;
      }
    };
  }, [isOpen, sdkLoaded, fileId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg w-[95vw] h-[90vh] max-w-7xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {fileName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-gray-600">Loading preview...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center px-6">
                <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-900 font-medium mb-2">Failed to load preview</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Box Preview Container */}
          <div
            id="box-preview-container"
            ref={containerRef}
            className="w-full h-full"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
