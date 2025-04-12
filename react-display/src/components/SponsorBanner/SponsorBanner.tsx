/* react-display/src/components/SponsorBanner/SponsorBanner.tsx */

import { useState, useEffect } from 'react';
import { useSponsor } from '../../contexts/SponsorContext';
import { SponsorItem } from './SponsorItem';

interface SponsorBannerProps {
	displayCount?: number;
	rotationInterval?: number;
}

export function SponsorBanner({
	displayCount = 3,
	rotationInterval = 10000,
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

		return () => {
			clearInterval(rotationTimer);
		};
	}, [isLoading, error, getRandomSponsorUrls, displayCount, rotationInterval]);

	if (isLoading) {
		return (
			<div className='w-full p-8 text-center bg-gray-100 rounded-lg my-4'>
				Loading sponsors...
			</div>
		);
	}

	if (error) {
		return (
			<div className='w-full p-8 text-center bg-red-100 text-red-800 rounded-lg my-4'>
				Failed to load sponsors: {error.message}
			</div>
		);
	}

	return (
		<div className='w-full bg-black bg-opacity-70 rounded-lg p-6 my-4 shadow-md'>
			<div className='flex justify-around items-center flex-wrap gap-6'>
				{sponsorUrls.map((url) => (
					<SponsorItem
						key={url.split('/').pop() ?? url}
						url={url}
					/>
				))}
			</div>
		</div>
	);
}
