/* react-display/src/components/Clock/Clock.tsx */

import { useEffect, useState } from 'react';
import { useTime } from '../../contexts/TimeContext';
import './Clock.css';

export function Clock() {
	const { currentTime } = useTime();
	const [displayTime, setDisplayTime] = useState<Date>(currentTime);

	// Update local state when context time changes
	useEffect(() => {
		setDisplayTime(currentTime);
	}, [currentTime]);

	// Format the time as HH:MM:SS
	const hours = displayTime.getHours().toString().padStart(2, '0');
	const minutes = displayTime.getMinutes().toString().padStart(2, '0');
	const seconds = displayTime.getSeconds().toString().padStart(2, '0');

	// Format the date as Day, Month DD, YYYY
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	const dateString = displayTime.toLocaleDateString('en-US', options);

	return (
		<div className='clock'>
			<div className='clock-time'>
				{hours}:{minutes}:{seconds}
			</div>
			<div className='clock-date'>{dateString}</div>
		</div>
	);
}
