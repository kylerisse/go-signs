import './App.css';
import { TimeProvider } from './contexts/TimeContext';
import { Clock } from './components/Clock';

function App() {
  return (
    <TimeProvider>
      <div className="app-container">
        <div>
          <img src="./logo.png" className="logo" alt="Logo"/>
          <img src="./wifi.png" className="wifi" alt="WiFi"/>
        </div>
        <h1>SCaLE Display</h1>
        <Clock />
      </div>
    </TimeProvider>
  );
}

export default App;
