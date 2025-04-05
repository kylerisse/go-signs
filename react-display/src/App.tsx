// react-display/src/App.tsx

import './App.css';
import { TimeProvider } from './contexts/TimeContext';
import { SponsorProvider } from './contexts/SponsorContext';
import { Clock } from './components/Clock';
import { SponsorBanner } from './components/SponsorBanner';
import scaleLogo from './assets/logo.png';
import scaleWifi from './assets/wifi.png';

function App() {
  return (
    <TimeProvider>
      <SponsorProvider>
        <div className="app-container">
          <div>
            <img src={scaleLogo} className="logo" alt="Logo"/>
            <img src={scaleWifi} className="wifi" alt="WiFi"/>
          </div>
          <h1>SCaLE Display</h1>
          <Clock />

          {/* Sponsor banner showing 3 sponsors that rotate every 10 seconds */}
          <SponsorBanner displayCount={3} rotationInterval={10000} />
        </div>
      </SponsorProvider>
    </TimeProvider>
  );
}

export default App;
