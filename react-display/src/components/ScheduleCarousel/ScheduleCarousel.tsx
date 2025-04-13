// react-display/src/components/ScheduleCarousel/ScheduleCarousel.tsx

import { useState, useEffect, useRef } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { SessionWithStatus } from '../../contexts/ScheduleContext/types';
import { useTime } from '../../contexts/TimeContext';
import { Spinner } from '../Spinner';

interface ScheduleCarouselProps {
	maxDisplay?: number;
	rotationInterval?: number; // in milliseconds
	autoRotate?: boolean;
}

export function ScheduleCarousel({
	maxDisplay = 6,
	rotationInterval = 10000, // 10 seconds
	autoRotate = true,
}: ScheduleCarouselProps) {
	const { isLoading, error, getCurrentAndUpcomingSessions } = useSchedule();
	const { currentTime } = useTime();
	const [sessions, setSessions] = useState<SessionWithStatus[]>([]);
	const [startIndex, setStartIndex] = useState(0);
	const lastRefreshTime = useRef<number>(0);

	const showLoading = isLoading || (sessions.length === 0 && !error);

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

	// Calculate the slice of sessions to display, ensure we don't exceed array bounds
	const displaySessions =
		sessions.length > 0
			? sessions.slice(
					Math.min(startIndex, Math.max(0, sessions.length - 1)),
					Math.min(startIndex + maxDisplay, sessions.length)
			  )
			: [];

	// Create a placeholder session object
	const emptySession = (): SessionWithStatus => ({
		Name: '',
		Description: '',
		Location: '',
		StartTime: new Date().toISOString(),
		EndTime: new Date().toISOString(),
		Speakers: [],
		Topic: '',
		status: {
			isInProgress: false,
			isStartingSoon: false,
			isPast: false,
			minutesRemaining: 0,
			minutesUntilStart: 0,
		},
	});

	// Create padded array with empty sessions as needed
	const paddedSessions = [...displaySessions];
	while (paddedSessions.length < maxDisplay) {
		paddedSessions.push(emptySession());
	}

	return (
		<div className='bg-black/70 w-full h-full rounded-lg overflow-hidden p-4'>
			{/* Main content container */}
			<div className='w-full h-full flex flex-col justify-between'>
				{showLoading ? (
					<div className='flex items-center justify-center h-full'>
						<div className='flex flex-col items-center text-gray-300'>
							<Spinner
								size='lg'
								className='text-white mb-4'
							/>
							<div className='text-lg'>Loading schedule...</div>
						</div>
					</div>
				) : error ? (
					<div className='flex items-center justify-center h-full'>
						<div className='text-lg text-red-400 animate-bounce'>
							Failed to load schedule: {error.message}
						</div>
					</div>
				) : sessions.length === 0 ? (
					<div className='flex items-center justify-center h-full'>
						<div className='text-lg text-gray-400 italic'>
							No current or upcoming sessions found.
						</div>
					</div>
				) : (
					// Display each session card with equal spacing
					<div className='flex flex-col justify-between h-full'>
						{paddedSessions.map((session, index) => {
							// Empty sessions have empty strings for all properties
							const isEmpty = !session.Name;

							return (
								<div
									key={`session-${String(index)}-${
										isEmpty ? 'empty' : encodeURIComponent(session.Name)
									}`}
									className={`rounded-md p-4 mb-2 transition-all duration-300 ${
										!isEmpty ? 'bg-black/80 text-white' : 'bg-black/20' // Empty placeholder with slight visibility
									}`}
								>
									{!isEmpty && (
										<>
											<div className='flex justify-between items-start'>
												{/* Left side - Session title and time */}
												<div className='flex-1 pr-4'>
													<div className='text-xl font-bold text-white mb-1 line-clamp-2'>
														{session.Name}
													</div>
													<div className='text-gray-300 text-sm'>
														{formatTime(session.StartTime)} -{' '}
														{formatTime(session.EndTime)}
														{isDifferentDay(
															session.StartTime,
															session.EndTime
														) && (
															<span className='ml-1 text-gray-400'>
																(next day)
															</span>
														)}
													</div>
												</div>

												{/* Right side - Room, status, and speakers */}
												<div className='flex flex-col items-end min-w-[180px]'>
													{/* Status indicator */}
													{session.status.isInProgress && (
														<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-green-700 text-white mb-1'>
															In Progress (
															{String(session.status.minutesRemaining)} min)
														</span>
													)}
													{session.status.isStartingSoon && (
														<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-amber-600 text-white mb-1'>
															Starting Soon (
															{String(session.status.minutesUntilStart)} min)
														</span>
													)}
													{!session.status.isInProgress &&
														!session.status.isStartingSoon && (
															<span className='text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap bg-blue-700 text-white mb-1'>
																Upcoming (
																{String(session.status.minutesUntilStart)} min)
															</span>
														)}

													{/* Speaker names */}
													<div className='text-right text-sm text-gray-300 italic mb-1'>
														{session.Speakers.join(', ')}
													</div>

													{/* Room and topic in a row */}
													<div className='flex justify-end mt-1 text-sm'>
														{session.Topic && (
															<span className='bg-gray-700 text-gray-200 px-2 py-1 rounded-md mr-2'>
																{session.Topic}
															</span>
														)}
														<span className='bg-blue-800 text-white font-bold px-2 py-1 rounded-md'>
															{session.Location}
														</span>
													</div>
												</div>
											</div>
										</>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
