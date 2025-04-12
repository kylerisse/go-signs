// react-display/src/components/ScheduleCarousel/ScheduleCarousel.tsx

import { useState, useEffect, useRef } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { SessionWithStatus } from '../../contexts/ScheduleContext/types';
import { useTime } from '../../contexts/TimeContext';

interface ScheduleCarouselProps {
	title?: string;
	maxDisplay?: number;
	rotationInterval?: number; // in milliseconds
	autoRotate?: boolean;
}

export function ScheduleCarousel({
	title = 'Schedule',
	maxDisplay = 5,
	rotationInterval = 10000, // 10 seconds
	autoRotate = true,
}: ScheduleCarouselProps) {
	const { isLoading, error, getCurrentAndUpcomingSessions } = useSchedule();
	const { currentTime } = useTime();
	const [sessions, setSessions] = useState<SessionWithStatus[]>([]);
	const [startIndex, setStartIndex] = useState(0);
	const lastRefreshTime = useRef<number>(0);

	// Update sessions when the schedule or current time changes
	useEffect(() => {
		// Only refresh data if it's been at least 30 seconds since last refresh
		// This prevents constant re-renders due to time updates
		const now = Date.now();
		if (now - lastRefreshTime.current > 30000) {
			const currentAndUpcoming = getCurrentAndUpcomingSessions();
			setSessions(currentAndUpcoming);
			// Only reset start index if we have a completely different set of sessions
			if (currentAndUpcoming.length !== sessions.length) {
				setStartIndex(0);
			}
			lastRefreshTime.current = now;
		}
	}, [getCurrentAndUpcomingSessions, currentTime, sessions.length]);

	// Auto-rotate through sessions
	useEffect(() => {
		if (!autoRotate || sessions.length <= maxDisplay) {
			return;
		}

		const rotationTimer = setInterval(() => {
			setStartIndex((prevIndex) => {
				// Calculate the next starting index, with wrap-around
				const nextIndex = prevIndex + maxDisplay;
				return nextIndex >= sessions.length ? 0 : nextIndex;
			});
		}, rotationInterval);

		return () => {
			clearInterval(rotationTimer);
		};
	}, [autoRotate, rotationInterval, sessions.length, maxDisplay]);

	// Format the time for display
	const formatTime = (timeString: string): string => {
		const date = new Date(timeString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Determine if start and end times are on different days
	const isDifferentDay = (startTime: string, endTime: string): boolean => {
		const start = new Date(startTime);
		const end = new Date(endTime);
		return (
			start.getDate() !== end.getDate() ||
			start.getMonth() !== end.getMonth() ||
			start.getFullYear() !== end.getFullYear()
		);
	};

	if (isLoading && sessions.length === 0) {
		return (
			<div className='w-full bg-black/70 rounded-lg p-6 my-4 shadow-md'>
				<h2 className='text-2xl mb-4 text-center'>{title}</h2>
				<div className='p-8 text-center text-gray-400'>Loading schedule...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='w-full bg-black/70 rounded-lg p-6 my-4 shadow-md'>
				<h2 className='text-2xl mb-4 text-center'>{title}</h2>
				<div className='p-8 text-center text-red-300'>
					Failed to load schedule: {error.message}
				</div>
			</div>
		);
	}

	if (sessions.length === 0) {
		return (
			<div className='w-full bg-black/70 rounded-lg p-6 my-4 shadow-md'>
				<h2 className='text-2xl mb-4 text-center'>{title}</h2>
				<div className='p-8 text-center text-gray-400 italic'>
					No current or upcoming sessions found.
				</div>
			</div>
		);
	}

	// Calculate the slice of sessions to display, ensure we don't exceed array bounds
	const safeStartIndex = Math.min(startIndex, Math.max(0, sessions.length - 1));
	const displaySessions = sessions.slice(
		safeStartIndex,
		safeStartIndex + maxDisplay
	);

	// Display "X of Y" if we have more sessions than can be displayed
	const paginationInfo =
		sessions.length > maxDisplay
			? `Showing ${String(safeStartIndex + 1)}-${String(
					Math.min(safeStartIndex + maxDisplay, sessions.length)
			  )} of ${String(sessions.length)}`
			: '';

	return (
		<div className='w-full bg-black/70 rounded-lg p-6 my-4 shadow-md text-white'>
			<h2 className='text-xl md:text-2xl mb-4 text-center border-b border-white/30 pb-2'>
				{title}
				{paginationInfo && (
					<span className='text-sm font-normal ml-4'>{paginationInfo}</span>
				)}
			</h2>

			{displaySessions.map((session) => (
				<div
					key={`${session.Name}-${session.StartTime}`}
					className='bg-white/10 rounded-md p-4 mb-4 transition-transform duration-200 animate-[fadeIn_0.5s_ease-out]'
				>
					<div className='flex flex-col md:flex-row justify-between items-start'>
						<div className='text-xl font-bold text-white flex-1'>
							{session.Name}
						</div>
						<div className='flex flex-col items-start md:items-end mt-2 md:mt-0 text-sm'>
							<div>
								{formatTime(session.StartTime)} - {formatTime(session.EndTime)}
								{isDifferentDay(session.StartTime, session.EndTime) && (
									<span> (next day)</span>
								)}
							</div>

							{/* Status indicator */}
							{session.status.isInProgress && (
								<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-green-600 text-green-900 mt-1'>
									In Progress ({String(session.status.minutesRemaining)} min
									remaining)
								</span>
							)}
							{session.status.isStartingSoon && (
								<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-orange-500 text-orange-900 mt-1'>
									Starting Soon ({String(session.status.minutesUntilStart)} min)
								</span>
							)}
							{!session.status.isInProgress &&
								!session.status.isStartingSoon && (
									<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-blue-500 text-blue-900 mt-1'>
										Upcoming ({String(session.status.minutesUntilStart)} min)
									</span>
								)}
						</div>
					</div>

					<div className='flex flex-col md:flex-row justify-between text-sm mt-2 text-gray-300'>
						<div className='font-bold text-yellow-400'>{session.Location}</div>
						<div className='italic'>{session.Speakers.join(', ')}</div>
					</div>

					{session.Topic && (
						<div className='bg-white/20 rounded px-2 py-1 inline-block text-xs text-yellow-400 mt-2'>
							{session.Topic}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
