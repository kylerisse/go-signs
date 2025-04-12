// react-display/src/contexts/ScheduleContext/ScheduleProvider.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScheduleContext } from './scheduleContext';
import { ScheduleData, SessionWithStatus, Presentation } from './types';
import { useTime } from '../TimeContext';

interface ScheduleProviderProps {
	children: React.ReactNode;
	refreshInterval?: number; // in milliseconds, default: 60000 (1 minute)
}

export function ScheduleProvider({
	children,
	refreshInterval = 60000,
}: ScheduleProviderProps) {
	const { currentTime } = useTime();
	const [schedule, setSchedule] = useState<ScheduleData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [lastHash, setLastHash] = useState<string>('');

	const fetchSchedule = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/schedule');
			if (!response.ok) {
				throw new Error(
					`Failed to fetch schedule: ${String(response.status)} ${
						response.statusText
					}`
				);
			}

			const data = (await response.json()) as ScheduleData;

			// If hash matches, no need to update the state
			if (data.contentHash === lastHash && lastHash !== '') {
				console.log('Schedule hash matches, no update needed');
				setIsLoading(false);
				return;
			}

			// If there are no presentations, don't update
			if (data.Presentations.length === 0) {
				console.log('No presentations in schedule, not updating');
				setIsLoading(false);
				return;
			}

			// Update the schedule state and hash
			console.log(
				`Updating schedule: ${String(
					data.Presentations.length
				)} sessions, hash: ${data.contentHash}`
			);
			setSchedule(data);
			setLastHash(data.contentHash);
		} catch (err) {
			console.error('Error fetching schedule:', err);
			setError(err instanceof Error ? err : new Error(String(err)));
		} finally {
			setIsLoading(false);
		}
	}, [lastHash]);

	// Initial fetch and set up interval for refreshing
	useEffect(() => {
		// Initial fetch
		void fetchSchedule();

		// Set up interval for refreshing
		const intervalId = setInterval(() => {
			void fetchSchedule();
		}, refreshInterval);

		// Cleanup interval on unmount
		return () => {
			clearInterval(intervalId);
		};
	}, [fetchSchedule, refreshInterval]);

	// Calculate session status based on current time
	const getSessionStatus = useCallback(
		(session: Presentation) => {
			// Parse start and end times - ensure proper Date objects
			const startTime = new Date(session.StartTime);
			const endTime = new Date(session.EndTime);

			// Use timestamp comparison for more reliable results
			const now = currentTime.getTime();
			const startTimestamp = startTime.getTime();
			const endTimestamp = endTime.getTime();

			// Check if session is currently in progress
			const isInProgress = now >= startTimestamp && now <= endTimestamp;

			// Calculate minutes until start
			const minutesUntilStart = isInProgress
				? 0
				: Math.max(0, Math.floor((startTimestamp - now) / 60000));

			// Check if session is starting soon (within 10 minutes)
			const isStartingSoon = !isInProgress && minutesUntilStart <= 10;

			// Calculate minutes remaining for in-progress sessions
			const minutesRemaining = isInProgress
				? Math.max(0, Math.floor((endTimestamp - now) / 60000))
				: 0;

			return {
				isInProgress,
				isStartingSoon,
				minutesUntilStart,
				minutesRemaining,
			};
		},
		[currentTime]
	);

	const getCurrentAndUpcomingSessions = useCallback(() => {
		if (!schedule?.Presentations) {
			return [];
		}

		const filteredSessions = schedule.Presentations.map((session) => {
			const status = getSessionStatus(session);
			return { ...session, status };
		})
			.filter((session) => {
				// Include current sessions with > 5 minutes remaining
				console.log(session);
				if (
					session.status.isInProgress &&
					session.status.minutesRemaining > 5
				) {
					return true;
				}

				// Include upcoming sessions starting within 45 minutes
				if (
					!session.status.isInProgress &&
					session.status.minutesUntilStart > 0 &&
					session.status.minutesUntilStart <= 45
				) {
					return true;
				}

				return false;
			})
			// Sort: current sessions first, then by start time
			.sort((a, b) => {
				// Current sessions first
				if (a.status.isInProgress && !b.status.isInProgress) return -1;
				if (!a.status.isInProgress && b.status.isInProgress) return 1;

				// Then by start time
				return (
					new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime()
				);
			});

		console.log(
			`Found ${String(filteredSessions.length)} current and upcoming sessions`
		);
		return filteredSessions as SessionWithStatus[];
	}, [schedule, getSessionStatus]);

	// Memoize context value to prevent unnecessary renders
	const contextValue = useMemo(
		() => ({
			schedule,
			isLoading,
			error,
			refreshSchedule: fetchSchedule,
			getCurrentAndUpcomingSessions,
		}),
		[schedule, isLoading, error, fetchSchedule, getCurrentAndUpcomingSessions]
	);

	return <ScheduleContext value={contextValue}>{children}</ScheduleContext>;
}
