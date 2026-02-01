// react-display/src/App.tsx

import { useState, useEffect } from 'react';
import { TimeProvider } from './contexts/TimeContext';
import { SponsorProvider } from './contexts/SponsorContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { Header } from './components/Header';
import { SponsorBanner } from './components/SponsorBanner';
import { ScheduleCarousel } from './components/ScheduleCarousel';
import { SponsorThankYou } from './components/SponsorThankYou';
import { ColocatedView } from './components/ColocatedView';
import { KeynoteView } from './components/KeynoteView';

type ViewType = 'hallway' | 'sponsors' | 'colocated' | 'keynote';

function App() {
	const [view, setView] = useState<ViewType>('hallway');

	// Read view from URL parameter on mount and when URL changes
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const viewParam = params.get('view') as ViewType | null;
		
		if (viewParam && ['hallway', 'sponsors', 'colocated', 'keynote'].includes(viewParam)) {
			setView(viewParam);
		} else {
			setView('hallway'); // Default view
		}

		// Listen for URL changes (e.g., browser back/forward)
		const handlePopState = () => {
			const newParams = new URLSearchParams(window.location.search);
			const newViewParam = newParams.get('view') as ViewType | null;
			if (newViewParam && ['hallway', 'sponsors', 'colocated', 'keynote'].includes(newViewParam)) {
				setView(newViewParam);
			} else {
				setView('hallway');
			}
		};

		window.addEventListener('popstate', handlePopState);
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, []);

	// Render based on view type
	const renderView = () => {
		switch (view) {
			case 'sponsors':
				return (
					<SponsorProvider>
						<SponsorThankYou />
					</SponsorProvider>
				);
			case 'colocated':
				return (
					<ScheduleProvider refreshInterval={60000}>
						<ColocatedView />
					</ScheduleProvider>
				);
			case 'keynote':
				return (
					<ScheduleProvider refreshInterval={60000}>
						<KeynoteView />
					</ScheduleProvider>
				);
			case 'hallway':
			default:
				return (
					<div className='flex flex-1 bg-white overflow-hidden'>
						{/* Main content area - 80% width */}
						<div className='w-4/5 p-2 overflow-y-auto'>
							{/* Schedule Carousel showing current and upcoming sessions */}
							<ScheduleProvider refreshInterval={60000}>
								<ScheduleCarousel
									maxDisplay={6}
									rotationInterval={15000}
								/>
							</ScheduleProvider>
						</div>

						{/* Sponsor banner - 20% width, vertically aligned */}
						<div className='w-1/5 p-2'>
							<SponsorProvider>
								<SponsorBanner
									displayCount={3}
									rotationInterval={10000}
								/>
							</SponsorProvider>
						</div>
					</div>
				);
		}
	};

	return (
		<div className='flex flex-col h-screen w-full overflow-hidden'>
			<TimeProvider>
				{/* Header with logo, clock and wifi info */}
				<Header />

				{/* Main content - switches based on view parameter */}
				{renderView()}
			</TimeProvider>
		</div>
	);
}

export default App;
