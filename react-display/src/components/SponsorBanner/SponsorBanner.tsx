// react-display/src/components/SponsorBanner/SponsorBanner.tsx

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
			<div className='h-full w-full p-4 text-center bg-gray-100 rounded-lg flex items-center justify-center'>
				Loading sponsors...
			</div>
		);
	}

	if (error) {
		return (
			<div className='h-full w-full p-4 text-center bg-red-100 text-red-800 rounded-lg flex items-center justify-center'>
				Failed to load sponsors: {error.message}
			</div>
		);
	}

	return (
		<div className='h-full w-full bg-black/70 rounded-lg p-4 shadow-md'>
			<div className='flex flex-col justify-around items-center h-full gap-4'>
				{sponsorUrls.map((url) => (
					<div
						key={url.split('/').pop() ?? url}
						className='w-full max-w-[200px] mx-auto'
					>
						<SponsorItem url={url} />
					</div>
				))}
			</div>
		</div>
	);
}
