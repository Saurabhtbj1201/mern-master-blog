import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'autorelaxed' | 'fluid';
  adLayoutKey?: string;
  className?: string;
}

export const AdSense = ({ adSlot, adFormat = 'auto', adLayoutKey, className = '' }: AdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only push ads once
    if (isLoaded.current) return;
    
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9261420035824805"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
      />
    </div>
  );
};

// Sidebar Ad for Home page - autorelaxed format
export const SidebarAd = () => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <AdSense 
        adSlot="8250018237" 
        adFormat="autorelaxed"
      />
    </div>
  );
};

// In-article Ad for Article Details page - fluid format
export const ArticleAd = () => {
  return (
    <div className="my-8">
      <AdSense 
        adSlot="1436541335" 
        adFormat="fluid"
        adLayoutKey="-gq-c+w-3l+7t"
      />
    </div>
  );
};

export default AdSense;
