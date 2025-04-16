// react-display/src/components/ScheduleCarousel/ScheduleItem.tsx

import { SessionWithStatus } from '../../contexts/ScheduleContext/types';

interface ScheduleItemProps {
	session: SessionWithStatus;
	isEmpty?: boolean;
}

export function ScheduleItem({ session, isEmpty = false }: ScheduleItemProps) {
	// Skip rendering details for empty placeholders
	if (isEmpty || !session.Name) {
		return (
			<div className='rounded-md p-4 mb-2 transition-all duration-300 bg-black/20'></div>
		);
	}

	// Format the time for display
	const formatTime = (timeString: string): string => {
		const date = new Date(timeString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	return (
		<div className='rounded-md p-4 mb-2 transition-all duration-300 bg-black/80 text-white'>
			<div className='flex justify-between items-start'>
				{/* Left side - Session title and time */}
				<div className='flex-1 pr-4'>
					<div className='text-2xl font-bold text-white mb-1 line-clamp-2'>
						{session.Name}
					</div>

					{/* Room and topic in a row */}
					<div className='flex justify-start mt-1 text-xl'>
						{session.Topic && (
							<span className='bg-gray-700 text-gray-200 px-2 py-1 rounded-md mr-2'>
								{session.Topic}
							</span>
						)}
						{/* Speaker names */}
						<span className='text-xl text-gray-300 font-bold italic mb-1 mt-auto'>
							{session.Speakers.join(', ')}
						</span>
					</div>
				</div>

				{/* Right side - Room, status, and speakers */}
				<div className='flex flex-col items-end min-w-[180px]'>
					{/* Status indicator */}
					{session.status.isInProgress && (
						<span className='text-xl font-bold py-1 px-2 rounded-md whitespace-nowrap bg-green-700 text-white mb-1'>
							In Progress
						</span>
					)}
					{session.status.isStartingSoon && (
						<span className='text-xl font-bold py-1 px-2 rounded-md whitespace-nowrap bg-amber-600 text-white mb-1 animate-pulse'>
							Starting in {String(session.status.minutesUntilStart)} min
						</span>
					)}
					{!session.status.isInProgress && !session.status.isStartingSoon && (
						<span className='text-xl font-bold py-1 px-2 rounded-md whitespace-nowrap bg-blue-700 text-white mb-1'>
							Upcoming in {String(session.status.minutesUntilStart)} min
						</span>
					)}

					{/* Room and topic in a row */}
					<div className='flex justify-end mt-1 text-xl mt-auto'>
						<span className='text-gray-300 text-l font-bold px-4 py-1'>
							{formatTime(session.StartTime)} - {formatTime(session.EndTime)}
						</span>
						<span className='bg-blue-800 text-white font-bold px-4 py-1 rounded-md'>
							{session.Location}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
