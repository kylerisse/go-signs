// react-display/src/App.tsx

import './App.css';
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
		<TimeProvider>
			<SponsorProvider>
				<ScheduleProvider refreshInterval={60000}>
					<div className='app-container'>
						<div>
							<img
								src={scaleLogo}
								className='logo'
								alt='Logo'
							/>
							<img
								src={scaleWifi}
								className='wifi'
								alt='WiFi'
							/>
						</div>
						<h1>SCaLE Display</h1>
						<Clock />

						{/* Schedule Carousel showing current and upcoming sessions */}
						<ScheduleCarousel
							title='Current & Upcoming Sessions'
							maxDisplay={3}
							rotationInterval={15000}
						/>

						{/* Sponsor banner showing 3 sponsors that rotate every 10 seconds */}
						<SponsorBanner
							displayCount={3}
							rotationInterval={10000}
						/>
					</div>
				</ScheduleProvider>
			</SponsorProvider>
		</TimeProvider>
	);
}

export default App;
