// react-display/src/components/ColocatedView/ColocatedView.tsx

import { useSchedule } from '../../contexts/ScheduleContext';
import { useTime } from '../../contexts/TimeContext';
import { ScheduleItem } from '../ScheduleCarousel/ScheduleItem';

export function ColocatedView() {
	const { schedule, isLoading, error } = useSchedule();
	const { currentTime } = useTime();

	if (isLoading) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-4xl font-bold text-gray-600'>Loading co-located events...</div>
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

	// Co-located events are separate conferences that run alongside SCaLE
	const colocatedTopics = [
		'DevOpsDay LA',
		'OpenInfra Days',
		'Kubernetes Community Day',
		'NixCon',
		'PlanetNix',
		'Ubucon',
		'SunSecCon',
		'Puppet',
		'MySQL',
		'PostgreSQL',
		'openSUSE',
		'GLADCamp',
		'Kwaai Summit',
		'Data on Kubernetes',
		'Kubeflow',
	];

	// Filter for co-located events by topic
	const now = new Date(currentTime);
	const colocatedEvents = schedule.Presentations.filter((presentation) => {
		// Check if the topic matches any co-located event topic
		const presentationTopic = presentation.Topic ?? '';
		const isColocated = colocatedTopics.some(
			(topic) => presentationTopic.toLowerCase() === topic.toLowerCase()
		);
		
		// Also filter for events happening today or in the future
		const startTime = new Date(presentation.StartTime);
		const isUpcoming = startTime >= now || 
			(startTime.getTime() <= now.getTime() && new Date(presentation.EndTime).getTime() >= now.getTime());
		
		return isColocated && isUpcoming;
	});

	// Sort by start time
	colocatedEvents.sort((a, b) => {
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
						Co-located Events
					</h1>
					<p className='text-2xl text-gray-300'>
						Special events and activities happening at SCaLE
					</p>
				</div>

				{/* Events List */}
				{colocatedEvents.length === 0 ? (
					<div className='text-center mt-12'>
						<p className='text-3xl text-gray-400'>
							No co-located events scheduled at this time
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{colocatedEvents.map((event, index) => {
							// Calculate status for the event
							const startTime = new Date(event.StartTime);
							const endTime = new Date(event.EndTime);
							const isInProgress = now >= startTime && now < endTime;
							const isStartingSoon = !isInProgress && startTime > now && 
								(startTime.getTime() - now.getTime()) < 15 * 60 * 1000; // 15 minutes
							const minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / (60 * 1000));

							const isPast = now > endTime;
							const minutesRemaining = isInProgress 
								? Math.floor((endTime.getTime() - now.getTime()) / (60 * 1000))
								: 0;

							const sessionWithStatus = {
								...event,
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
									key={`colocated-${String(index)}-${event.Name}`}
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
