import { useState, useEffect } from 'react';
import { useSponsor } from '../../contexts/SponsorContext';
import nocPenguin from '../../assets/noc-penguin.png';
import './SponsorBanner.css';

interface SponsorBannerProps {
  // How many sponsors to display at once
  displayCount?: number;
  // How often to rotate sponsors (in milliseconds)
  rotationInterval?: number;
}

export function SponsorBanner({
  displayCount = 3,
  rotationInterval = 10000  // 10 seconds by default
}: SponsorBannerProps) {
  const { getRandomSponsorUrls, isLoading, error } = useSponsor();
  const [sponsorUrls, setSponsorUrls] = useState<string[]>([]);

  // Initialize with random sponsor images
  useEffect(() => {
    if (!isLoading && !error) {
      setSponsorUrls(getRandomSponsorUrls(displayCount));
    }
  }, [isLoading, error, getRandomSponsorUrls, displayCount]);

  // Rotate sponsors at the specified interval
  useEffect(() => {
    if (isLoading || error) return;

    const rotationTimer = setInterval(() => {
      setSponsorUrls(getRandomSponsorUrls(displayCount));
    }, rotationInterval);

    // Clean up the timer when the component unmounts
    return () => {
      clearInterval(rotationTimer);
    };
  }, [isLoading, error, getRandomSponsorUrls, displayCount, rotationInterval]);

  if (isLoading) {
    return <div className="sponsor-banner-loading">Loading sponsors...</div>;
  }

  if (error) {
    return <div className="sponsor-banner-error">Failed to load sponsors: {error.message}</div>;
  }

  return (
    <>
      <div className="sponsor-banner">
        <div className="sponsor-banner-container">
          {sponsorUrls.map((url) => {
            // Extract filename from the URL to use as a more reliable key
            const filename = url.split('/').pop() ?? url;
            return (
              <div className="sponsor-item" key={filename}>
                <img
                  src={url}
                  alt="Sponsor"
                  className="sponsor-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Use the bundled nocPenguin image as a fallback
                    target.src = nocPenguin;
                    target.alt = 'Sponsor (image unavailable)';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Hidden preloading of fallback image */}
      <div style={{ display: 'none' }}>
        <img src={nocPenguin} alt="preload nocPenguin" />
      </div>
    </>
  );
}
