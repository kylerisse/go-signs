/* react-display/src/components/SponsorBanner/SponsorBanner.tsx */

import { useState, useEffect } from 'react';
import nocPenguin from '../../assets/noc-penguin.png';
import './SponsorBanner.css';

interface SponsorItemProps {
  url: string;
}

export function SponsorItem({ url }: SponsorItemProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (url !== currentUrl) {
      // When a new URL is received, set the current one as previous
      setPrevUrl(currentUrl);
      setCurrentUrl(url);
      setLoaded(false);

      // Clear previous after the fade duration (800ms)
      const timer = setTimeout(() => {
        setPrevUrl(null);
      }, 800);
      return () => { clearTimeout(timer); }
    }
  }, [url, currentUrl]);

  return (
    <div className="sponsor-item">
      {/* Render previous image for fade-out, if available */}
      {prevUrl && (
        <img
          src={prevUrl}
          alt="Sponsor fading out"
          className="sponsor-image fade-out"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = nocPenguin;
            target.alt = 'Sponsor (image unavailable)';
          }}
        />
      )}
      <img
        src={currentUrl}
        alt="Sponsor"
        className={`sponsor-image ${loaded ? 'fade-in' : 'preload'}`}
        onLoad={() => { setLoaded(true)} }
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = nocPenguin;
          target.alt = 'Sponsor (image unavailable)';
        }}
      />
    {/* Hidden preloading of fallback image */}
      <div style={{ display: 'none' }}>
        <img src={nocPenguin} alt="preload nocPenguin" />
      </div>
    </div>
  );
}
