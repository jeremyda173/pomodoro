import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { playEndChime } from '../services/soundManager';
import { notify } from '../services/notifications';

const DEFAULT_SETTINGS = {
	workMinutes: 25,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	intervalsBeforeLongBreak: 4,
	autoStartNext: true,
	soundEnabled: true,
};

export function usePomodoro() {
	const [settings, setSettings] = useLocalStorage('pomodoro_settings', DEFAULT_SETTINGS);
	const [stats, setStats] = useLocalStorage('pomodoro_stats', { sessions: [] });
	const [phase, setPhase] = useLocalStorage('pomodoro_phase', 'work'); // 'work' | 'short' | 'long'
	const [isRunning, setIsRunning] = useLocalStorage('pomodoro_running', false);
	const [completedWorkIntervals, setCompletedWorkIntervals] = useLocalStorage('pomodoro_completed_intervals', 0);
	const [remainingMs, setRemainingMs] = useState(() => getPhaseDurationMs(phase, settings));
	const tickRef = useRef(null);
	const lastTickTsRef = useRef(null);
	const sessionStartRef = useRef(null);
	const completionInProgressRef = useRef(false);
	const lastCompletionAtRef = useRef(0);
	const isRunningRef = useRef(isRunning);
	const completePhaseRef = useRef();

	function getPhaseDurationMs(p, s) {
		if (p === 'work') return s.workMinutes * 60_000;
		if (p === 'short') return s.shortBreakMinutes * 60_000;
		return s.longBreakMinutes * 60_000;
	}

	useEffect(() => {
		if (!isRunning) setRemainingMs(getPhaseDurationMs(phase, settings));
	}, [phase, settings.workMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, isRunning]);

	const formattedTime = useMemo(() => {
		const totalSeconds = Math.max(0, Math.round(remainingMs / 1000));
		const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
		const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}, [remainingMs]);

	const start = useCallback(() => {
		if (isRunning) return;
		setIsRunning(true);
		lastTickTsRef.current = performance.now();
		if (!sessionStartRef.current) sessionStartRef.current = Date.now();
		// RAF will be scheduled by the effect when isRunning becomes true
	}, [isRunning]);

	const pause = useCallback(() => {
		setIsRunning(false);
		if (tickRef.current) cancelAnimationFrame(tickRef.current);
		tickRef.current = null;
		lastTickTsRef.current = null;
	}, []);

	const reset = useCallback(() => {
		pause();
		setRemainingMs(getPhaseDurationMs(phase, settings));
		sessionStartRef.current = null;
	}, [pause, phase, settings]);

	const switchPhase = useCallback((nextPhase) => {
		setIsRunning(false); // Stop current timer first
		setPhase(nextPhase);
		setRemainingMs(getPhaseDurationMs(nextPhase, settings));
		sessionStartRef.current = null;
		// Auto-start logic will be handled by useEffect that watches for phase changes
	}, [setPhase, settings]);

	const completePhase = useCallback(() => {
		if (completionInProgressRef.current) return;
		completionInProgressRef.current = true;
		if (settings.soundEnabled) playEndChime();
		notify('Pomodoro', { body: phase === 'work' ? '¡Tiempo de descanso!' : '¡Hora de trabajar!' });
		if (phase === 'work') {
			const now = Date.now();
			setStats((prev) => {
				const head = prev.sessions[0];
				if (head && Math.abs((head.completedAt || 0) - now) < 1000) return prev;
				if (Math.abs(now - lastCompletionAtRef.current) < 1000) return prev;
				lastCompletionAtRef.current = now;
				return {
					...prev,
					sessions: [
						{ id: crypto.randomUUID(), type: 'work', completedAt: now, durationMs: settings.workMinutes * 60_000 },
						...prev.sessions,
					],
				};
			});
			setCompletedWorkIntervals((n) => n + 1);
		}
		if (phase === 'work') {
			const shouldLong = (completedWorkIntervals + 1) % settings.intervalsBeforeLongBreak === 0;
			switchPhase(shouldLong ? 'long' : 'short');
		} else {
			switchPhase('work');
		}
		setTimeout(() => { completionInProgressRef.current = false; }, 300);
	}, [phase, settings, completedWorkIntervals, switchPhase, setStats, setCompletedWorkIntervals]);

	useEffect(() => {
		isRunningRef.current = isRunning;
	}, [isRunning]);

	useEffect(() => {
		completePhaseRef.current = completePhase;
	}, [completePhase]);

	const tickFnRef = useRef();
	tickFnRef.current = () => {
		if (!isRunningRef.current) return;
		const now = performance.now();
		const delta = lastTickTsRef.current ? now - lastTickTsRef.current : 0;
		lastTickTsRef.current = now;
		setRemainingMs((ms) => {
			const next = ms - delta;
			if (next <= 0) {
				setIsRunning(false);
				if (completePhaseRef.current) {
					setTimeout(() => completePhaseRef.current(), 0);
				}
				return 0;
			}
			return next;
		});
		if (isRunningRef.current) {
			tickRef.current = requestAnimationFrame(tickFnRef.current);
		}
	};

	const tick = useCallback(() => {
		tickFnRef.current();
	}, []);

	useEffect(() => {
		if (isRunning) {
			if (!tickRef.current) {
				lastTickTsRef.current = performance.now();
				tickRef.current = requestAnimationFrame(tickFnRef.current);
			}
		} else {
			if (tickRef.current) {
				cancelAnimationFrame(tickRef.current);
				tickRef.current = null;
			}
		}
		return () => {
			if (tickRef.current) {
				cancelAnimationFrame(tickRef.current);
				tickRef.current = null;
			}
		};
	}, [isRunning]);

	// Auto-start when phase changes if autoStartNext is enabled
	const previousPhaseRef = useRef(phase);
	useEffect(() => {
		// Check if phase actually changed
		if (previousPhaseRef.current !== phase && settings.autoStartNext && !isRunning) {
			const timer = setTimeout(() => {
				if (!isRunning) {
					setIsRunning(true);
					lastTickTsRef.current = performance.now();
					sessionStartRef.current = Date.now();
				}
			}, 200);
			previousPhaseRef.current = phase;
			return () => clearTimeout(timer);
		} else if (previousPhaseRef.current !== phase) {
			previousPhaseRef.current = phase;
		}
	}, [phase, settings.autoStartNext, isRunning]);

	const setSetting = useCallback((name, value) => {
		setSettings((prev) => ({ ...prev, [name]: value }));
	}, [setSettings]);

	const clearStats = useCallback(() => setStats({ sessions: [] }), [setStats]);

	return {
		phase,
		isRunning,
		remainingMs,
		formattedTime,
		settings,
		stats,
		completedWorkIntervals,
		start,
		pause,
		reset,
		switchPhase,
		setSetting,
		clearStats,
	};
}


