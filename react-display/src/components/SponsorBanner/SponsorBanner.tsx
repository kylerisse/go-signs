/* react-display/src/components/SponsorBanner/SponsorBanner.tsx */

import { useState, useEffect } from 'react';
import { useSponsor } from '../../contexts/SponsorContext';
import { SponsorItem } from './SponsorItem';
import './SponsorBanner.css';

interface SponsorBannerProps {
  displayCount?: number;
  rotationInterval?: number;
}

export function SponsorBanner({
  displayCount = 3,
  rotationInterval = 10000
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

    return () => { clearInterval(rotationTimer); }
  }, [isLoading, error, getRandomSponsorUrls, displayCount, rotationInterval]);

  if (isLoading) {
    return <div className="sponsor-banner-loading">Loading sponsors...</div>;
  }

  if (error) {
    return (
      <div className="sponsor-banner-error">
        Failed to load sponsors: {error.message}
      </div>
    );
  }

  return (
    <div className="sponsor-banner">
      <div className="sponsor-banner-container">
        {sponsorUrls.map((url) => (
          <SponsorItem key={url.split('/').pop() ?? url} url={url} />
        ))}
      </div>
    </div>
  );
}
