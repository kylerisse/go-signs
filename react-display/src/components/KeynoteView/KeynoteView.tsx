// react-display/src/components/KeynoteView/KeynoteView.tsx

import { useSchedule } from '../../contexts/ScheduleContext';
import { useTime } from '../../contexts/TimeContext';
import { ScheduleItem } from '../ScheduleCarousel/ScheduleItem';

export function KeynoteView() {
	const { schedule, isLoading, error } = useSchedule();
	const { currentTime } = useTime();

	if (isLoading) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-gray-600'>Loading keynotes...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-red-600'>
					Failed to load schedule: {error.message}
				</div>
			</div>
		);
	}

	if (!schedule?.Presentations) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-gray-600'>No schedule data available</div>
			</div>
		);
	}

	// Filter for keynotes
	const now = new Date(currentTime);
	const keynotes = schedule.Presentations.filter((presentation) => {
		const topic = presentation.Topic ?? '';
		const isKeynote = topic.toLowerCase().includes('keynote');
		const startTime = new Date(presentation.StartTime);
		const isUpcoming = startTime >= now || 
			(startTime.getTime() <= now.getTime() && new Date(presentation.EndTime).getTime() >= now.getTime());
		
		return isKeynote && isUpcoming;
	});

	// Sort by start time
	keynotes.sort((a, b) => {
		const timeA = new Date(a.StartTime).getTime();
		const timeB = new Date(b.StartTime).getTime();
		return timeA - timeB;
	});

	return (
		<div className='h-full w-full p-8 overflow-y-auto bg-gradient-to-b from-[#212121] to-[#2c2c42]'>
			<div className='max-w-6xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-8'>
					<h1 className='text-6xl font-bold text-white mb-4'>
						Keynote Presentations
					</h1>
					<p className='text-2xl text-gray-300'>
						Featured keynote speakers at SCaLE
					</p>
				</div>

				{/* Keynotes List */}
				{keynotes.length === 0 ? (
					<div className='text-center mt-12'>
						<p className='text-3xl text-gray-400'>
							No keynotes scheduled at this time
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{keynotes.map((keynote, index) => {
							// Calculate status for the keynote
							const startTime = new Date(keynote.StartTime);
							const endTime = new Date(keynote.EndTime);
							const isInProgress = now >= startTime && now < endTime;
							const isStartingSoon = !isInProgress && startTime > now && 
								(startTime.getTime() - now.getTime()) < 15 * 60 * 1000; // 15 minutes
							const minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / (60 * 1000));

							const isPast = now > endTime;
							const minutesRemaining = isInProgress 
								? Math.floor((endTime.getTime() - now.getTime()) / (60 * 1000))
								: 0;

							const sessionWithStatus = {
								...keynote,
								status: {
									isInProgress,
									isStartingSoon,
									isPast,
									minutesRemaining,
									minutesUntilStart: minutesUntilStart > 0 ? minutesUntilStart : 0,
								},
							};

							return (
								<ScheduleItem
									key={`keynote-${String(index)}-${keynote.Name}`}
									session={sessionWithStatus}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
