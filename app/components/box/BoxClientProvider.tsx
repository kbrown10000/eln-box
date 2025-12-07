'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BoxClientContextType {
  sdkLoaded: boolean;
  error: string | null;
}

const BoxClientContext = createContext<BoxClientContextType>({
  sdkLoaded: false,
  error: null,
});

export function useBoxSDK() {
  return useContext(BoxClientContext);
}

export default function BoxClientProvider({ children }: { children: ReactNode }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double loading
    if (typeof window !== 'undefined' && window.Box) {
      setSdkLoaded(true);
      return;
    }

    // Load Box Explorer CSS
    const explorerCss = document.createElement('link');
    explorerCss.rel = 'stylesheet';
    explorerCss.href = 'https://cdn01.boxcdn.net/platform/elements/19.0.0/en-US/explorer.css';
    document.head.appendChild(explorerCss);

    // Load Box Preview CSS
    const previewCss = document.createElement('link');
    previewCss.rel = 'stylesheet';
    previewCss.href = 'https://cdn01.boxcdn.net/platform/preview/2.94.0/en-US/preview.css';
    document.head.appendChild(previewCss);

    // Load Box Explorer JS (Core)
    const script = document.createElement('script');
    script.src = 'https://cdn01.boxcdn.net/platform/elements/19.0.0/en-US/explorer.js';
    script.async = true;
    
    script.onload = () => {
      // Load Preview JS after Explorer
      const previewScript = document.createElement('script');
      previewScript.src = 'https://cdn01.boxcdn.net/platform/preview/2.94.0/en-US/preview.js';
      previewScript.async = true;
      previewScript.onload = () => {
        setSdkLoaded(true);
        console.log('Box UI Elements SDK loaded');
      };
      previewScript.onerror = () => setError('Failed to load Box Preview SDK');
      document.body.appendChild(previewScript);
    };
    
    script.onerror = () => setError('Failed to load Box Explorer SDK');
    document.body.appendChild(script);

    return () => {
      // Cleanup logic if needed, though scripts usually persist
    };
  }, []);

  return (
    <BoxClientContext.Provider value={{ sdkLoaded, error }}>
      {children}
    </BoxClientContext.Provider>
  );
}
