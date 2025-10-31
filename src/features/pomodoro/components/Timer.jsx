export default function Timer({ phase, formattedTime, progress = 0 }) {
	const label = phase === 'work' ? 'Trabajo' : phase === 'short' ? 'Descanso corto' : 'Descanso largo';
	const size = 260;
	const stroke = 14;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const clamped = Math.max(0, Math.min(1, progress));
	const dash = c * clamped;
	return (
		<div className="timer">
			<div className="phase-badge">{label}</div>
			<div className="ring-wrap">
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring">
					<defs>
						<linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="var(--ring-start)" />
							<stop offset="100%" stopColor="var(--ring-end)" />
						</linearGradient>
					</defs>
					<circle cx={size/2} cy={size/2} r={r} stroke="var(--ring-bg)" strokeWidth={stroke} fill="none" />
					<circle
						cx={size/2}
						cy={size/2}
						r={r}
						stroke="url(#ringGrad)"
						strokeWidth={stroke}
						fill="none"
						strokeDasharray={`${dash} ${c}`}
						strokeLinecap="round"
						transform={`rotate(-90 ${size/2} ${size/2})`}
					/>
				</svg>
				<div className="ring-content">
					<div className="timer-time" aria-live="polite">{formattedTime}</div>
				</div>
			</div>
		</div>
	);
}


