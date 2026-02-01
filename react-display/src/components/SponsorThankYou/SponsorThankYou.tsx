// react-display/src/components/SponsorThankYou/SponsorThankYou.tsx

import { useSponsor } from '../../contexts/SponsorContext';
import { SponsorItem } from '../SponsorBanner/SponsorItem';

export function SponsorThankYou() {
	const { getAllSponsorUrls, isLoading, error } = useSponsor();

	if (isLoading) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-gray-600'>Loading sponsors...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-red-600'>
					Failed to load sponsors: {error.message}
				</div>
			</div>
		);
	}

	const sponsorUrls = getAllSponsorUrls();

	return (
		<div className='h-full w-full p-8 overflow-y-auto bg-gradient-to-b from-[#212121] to-[#2c2c42]'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-6xl font-bold text-white mb-4'>
						Thank You to Our Sponsors
					</h1>
					<p className='text-2xl text-gray-300'>
						SCaLE is made possible by the generous support of our sponsors
					</p>
				</div>

				{/* Sponsor Grid */}
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
					{sponsorUrls.map((url, index) => (
						<div
							key={`sponsor-${String(index)}-${url.split('/').pop() ?? url}`}
							className='bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center min-h-[150px]'
						>
							<SponsorItem url={url} index={index} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
