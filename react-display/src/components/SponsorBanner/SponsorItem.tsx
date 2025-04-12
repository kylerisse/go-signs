// react-display/src/components/SponsorBanner/SponsorItem.tsx

import { useState, useEffect } from 'react';
import nocPenguin from '../../assets/noc-penguin.png';

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
			return () => {
				clearTimeout(timer);
			};
		}
	}, [url, currentUrl]);

	return (
		<div className='relative w-full aspect-square bg-white rounded-md shadow-sm overflow-hidden transition-transform'>
			{/* Render previous image for fade-out, if available */}
			{prevUrl && (
				<img
					src={prevUrl}
					alt='Sponsor fading out'
					className='absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-1000 z-10'
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.src = nocPenguin;
						target.alt = 'Sponsor (image unavailable)';
					}}
				/>
			)}
			<img
				src={currentUrl}
				alt='Sponsor'
				className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${
					loaded ? 'opacity-100 z-20' : 'opacity-0'
				}`}
				onLoad={() => {
					setLoaded(true);
				}}
				onError={(e) => {
					const target = e.target as HTMLImageElement;
					target.src = nocPenguin;
					target.alt = 'Sponsor (image unavailable)';
				}}
			/>
			{/* Hidden preloading of fallback image */}
			<div className='hidden'>
				<img
					src={nocPenguin}
					alt='preload nocPenguin'
				/>
			</div>
		</div>
	);
}
