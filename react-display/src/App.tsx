// react-display/src/App.tsx

import { TimeProvider } from './contexts/TimeContext';
import { SponsorProvider } from './contexts/SponsorContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { Clock } from './components/Clock';
import { SponsorBanner } from './components/SponsorBanner';
import { ScheduleCarousel } from './components/ScheduleCarousel';
import scaleLogo from './assets/logo.png';
import scaleWifi from './assets/wifi.png';

function App() {
	return (
		<div className='flex flex-col items-center justify-center p-8'>
			<TimeProvider>
				<div>
					<img
						src={scaleLogo}
						className='h-24 p-6 transition-all duration-300'
						alt='Logo'
					/>
					<Clock />
					<img
						src={scaleWifi}
						className='h-24 p-6 transition-all duration-300'
						alt='WiFi'
					/>
				</div>

				{/* Schedule Carousel showing current and upcoming sessions */}
				<ScheduleProvider refreshInterval={60000}>
					<ScheduleCarousel
						title=''
						maxDisplay={3}
						rotationInterval={15000}
					/>
				</ScheduleProvider>
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
