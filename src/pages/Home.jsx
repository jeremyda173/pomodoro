import { useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { usePomodoro } from '../features/pomodoro/hooks/usePomodoro';
import Timer from '../features/pomodoro/components/Timer';
import Controls from '../features/pomodoro/components/Controls';
import Settings from '../features/pomodoro/components/Settings';
import Stats from '../features/pomodoro/components/Stats';
import { ensureNotificationPermission } from '../features/pomodoro/services/notifications';
import { initAudio } from '../features/pomodoro/services/soundManager';

export default function Home() {
	const {
		phase,
		isRunning,
		formattedTime,
		remainingMs,
		settings,
		stats,
		start,
		pause,
		reset,
		switchPhase,
		setSetting,
		clearStats,
	} = usePomodoro();

	useEffect(() => {
		ensureNotificationPermission();
	}, []);

	useEffect(() => {
		document.title = `${formattedTime} • ${phase === 'work' ? 'Trabajo' : phase === 'short' ? 'Descanso corto' : 'Descanso largo'} | Pomodoro`;
	}, [formattedTime, phase]);

	const [focus, setFocus] = useState(false);
	const [accent, setAccent] = useLocalStorage('ui_accent', 'default'); // 'default' | 'rose' | 'aqua' | 'violet'

	useEffect(() => {
		document.body.classList.add('theme-dark');
		document.body.classList.remove('theme-light');
		document.body.classList.toggle('accent-rose', accent === 'rose');
		document.body.classList.toggle('accent-aqua', accent === 'aqua');
		document.body.classList.toggle('accent-violet', accent === 'violet');
		document.body.classList.toggle('accent-default', accent === 'default');
	}, [accent]);

	useEffect(() => {
		const onKey = (e) => {
			if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
			if (e.key.toLowerCase() === 'p') {
				if (isRunning) pause(); else handleStart();
			}
			if (e.key.toLowerCase() === 'r') {
				reset();
			}
			if (e.key.toLowerCase() === 'n') {
				switchPhase(phase === 'work' ? 'short' : phase === 'short' ? 'long' : 'work');
			}
			if (e.key.toLowerCase() === 'f') {
				toggleFocus();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isRunning, pause, reset, switchPhase, phase, handleStart]);

	const handleStart = useCallback(() => {
		initAudio();
		start();
	}, [start]);

	const toggleFocus = async () => {
		setFocus((f) => !f);
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch (err) {
			void err;
		}
	};

	const totalMs = phase === 'work' ? settings.workMinutes * 60000 : phase === 'short' ? settings.shortBreakMinutes * 60000 : settings.longBreakMinutes * 60000;
	const progress = Math.max(0, Math.min(1, 1 - (remainingMs / totalMs)));

	return (
		<div className={`app${focus ? ' focus' : ''} phase-${phase}`}>
			<header className="header">
				<div className="header-top">
					<h1>Temporizador Pomodoro</h1>
					<p className="subtitle">Mejora tu productividad con sesiones enfocadas</p>
				</div>
				<div className="toolbar">
					<div className="toolbar-left">
						<div className="accent-swatches">
							<button className={`swatch default${accent==='default'?' active':''}`} onClick={() => setAccent('default')} aria-label="Tema default" />
							<button className={`swatch rose${accent==='rose'?' active':''}`} onClick={() => setAccent('rose')} aria-label="Tema rosa" />
							<button className={`swatch aqua${accent==='aqua'?' active':''}`} onClick={() => setAccent('aqua')} aria-label="Tema aqua" />
							<button className={`swatch violet${accent==='violet'?' active':''}`} onClick={() => setAccent('violet')} aria-label="Tema violeta" />
						</div>
					</div>
					<div className="toolbar-right">
						<button className="btn btn--md btn--secondary" onClick={toggleFocus}>{focus ? 'Salir enfoque (F)' : 'Modo enfoque (F)'}</button>
					</div>
				</div>
			</header>
			<main className="layout">
				<section className="panel primary">
					<Timer phase={phase} formattedTime={formattedTime} progress={progress} />
					<Controls
						isRunning={isRunning}
						onStart={handleStart}
						onPause={pause}
						onReset={reset}
						onNext={() => switchPhase(phase === 'work' ? 'short' : phase === 'short' ? 'long' : 'work')}
					/>
				</section>
				<section className="panel side">
					<Settings settings={settings} setSetting={setSetting} />
					<Stats stats={stats} onClear={clearStats} />
				</section>
			</main>
			<footer className="footer">Hecho con React • Notificaciones • Web Audio • LocalStorage</footer>
		</div>
	);
}


