/* react-display/src/components/Clock/Clock.tsx */

import { useEffect, useState } from 'react';
import { useTime } from '../../contexts/TimeContext';

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

	// Format the date as Day, Month DD, YYYY
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	const dateString = displayTime.toLocaleDateString('en-US', options);

	return (
		<div className='bg-black bg-opacity-70 text-white p-4 rounded-lg text-center my-4 shadow-md inline-block min-w-[300px] font-mono'>
			<div className='text-3xl font-bold mb-2'>
				{hours}:{minutes}
			</div>
			<div className='text-lg'>{dateString}</div>
		</div>
	);
}
