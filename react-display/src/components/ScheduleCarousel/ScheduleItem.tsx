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
		<div className='rounded-md p-4 mb-2 transition-all duration-300 bg-[#212121] text-white'>
			<div className='flex justify-between items-start'>
				{/* Left side - Session title and time */}
				<div className='flex-1 pr-4'>
					<div className='text-2xl font-bold text-white mb-1 line-clamp-2 px-2'>
						{session.Name}
					</div>

					{/* Room and topic in a row */}
					<div className='flex justify-start mt-1 text-xl px-2 py-2'>
						{session.Topic && (
							<span className='bg-[#02bfe7] font-bold text-[#212121] px-2 py-1 rounded-md mr-2'>
								{session.Topic}
							</span>
						)}
						{/* Speaker names */}
						<span className='text-xl text-white font-bold italic mb-1 mt-auto'>
							{session.Speakers.join(', ')}
						</span>
					</div>
				</div>

				{/* Right side - Room, status, and speakers */}
				<div className='flex flex-col items-end min-w-[180px] py-1'>
					{/* Status indicator */}
					{session.status.isInProgress && (
						<span className='text-xl font-bold py-1 px-4 py-1 rounded-md whitespace-nowrap bg-[#2e8540] -700 text-white mb-1'>
							In Progress
						</span>
					)}
					{session.status.isStartingSoon && (
						<span className='text-xl font-bold py-1 px-4 py-1 rounded-md whitespace-nowrap bg-[#f9c642] text-[#212121] mb-1 animate-pulse'>
							Starting in {String(session.status.minutesUntilStart)} min
						</span>
					)}
					{!session.status.isInProgress && !session.status.isStartingSoon && (
						<span className='text-xl font-bold py-1 px-4 py-1 rounded-md whitespace-nowrap bg-[#205493] text-white mb-1'>
							Upcoming in {String(session.status.minutesUntilStart)} min
						</span>
					)}

					{/* Room and topic in a row */}
					<div className='flex justify-end mt-1 text-xl mt-auto py-2'>
						<span className='text-white text-l font-bold px-4 py-1'>
							{formatTime(session.StartTime)} - {formatTime(session.EndTime)}
						</span>
						<span className='bg-[#dce4ef] text-[#212121] font-bold px-4 py-1 rounded-md'>
							{session.Location}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
