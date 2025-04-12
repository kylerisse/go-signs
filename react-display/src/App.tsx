// react-display/src/App.tsx

import { TimeProvider } from './contexts/TimeContext';
import { SponsorProvider } from './contexts/SponsorContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { Header } from './components/Header';
import { SponsorBanner } from './components/SponsorBanner';
import { ScheduleCarousel } from './components/ScheduleCarousel';

function App() {
	return (
		<div className='flex flex-col h-screen w-full overflow-hidden'>
			<TimeProvider>
				{/* Header with logo, clock and wifi info */}
				<Header />

				<div className='flex-1 bg-gray-100 p-4 overflow-y-auto'>
					{/* Schedule Carousel showing current and upcoming sessions */}
					<ScheduleProvider refreshInterval={60000}>
						<ScheduleCarousel
							title='Current & Upcoming Sessions'
							maxDisplay={3}
							rotationInterval={15000}
						/>
					</ScheduleProvider>
				</div>
			</TimeProvider>

			{/* Sponsor banner showing 3 sponsors that rotate every 10 seconds */}
			<SponsorProvider>
				<SponsorBanner
					displayCount={3}
					rotationInterval={10000}
				/>
			</SponsorProvider>
		</div>
	);
}

export default App;
