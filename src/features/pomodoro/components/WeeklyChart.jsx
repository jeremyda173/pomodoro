function getStartOfWeek(date) {
	const d = new Date(date);
	const day = d.getDay(); // 0 Sun ... 6 Sat
	const diff = (day + 6) % 7; // make Monday=0
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - diff);
	return d;
}

function aggregateWeek(sessions) {
	const now = new Date();
	const start = getStartOfWeek(now);
	const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
	const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
	const totals = new Array(7).fill(0);
	sessions.forEach((s) => {
		if (s.type !== 'work' || !s.completedAt) return;
		const d = new Date(s.completedAt);
		if (d < start || (d - start) > 6 * 86400000) return;
		const idx = Math.floor((d - start) / 86400000);
		totals[idx] += (s.durationMs || 0);
	});
	return { labels, totals };
}

export default function WeeklyChart({ sessions, selectedIndex, onSelect }) {
    const { labels, totals } = aggregateWeek(sessions || []);
	const max = Math.max(30 * 60000, ...totals); // at least 30m for scale
	const bars = totals.map((v) => Math.round((v / max) * 100));
    const todayIdx = ((new Date().getDay() + 6) % 7); // Monday=0
	return (
		<div className="weekly-chart">
			<div className="weekly-chart-header">
				<strong>Esta semana</strong>
				<span className="muted">minutos trabajados</span>
			</div>
            <div className="weekly-bars">
                {bars.map((height, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`bar-wrap as-button${i===todayIdx ? ' is-today' : ''}${selectedIndex===i ? ' is-selected' : ''}`}
                        title={`${Math.round(totals[i] / 60000)} min`}
                        aria-pressed={selectedIndex===i}
                        onClick={() => onSelect && onSelect(i)}
                    >
                        <div className="bar" style={{ height: `${height}%` }} />
                        <div className="bar-label">{labels[i]}</div>
                    </button>
                ))}
			</div>
		</div>
	);
}


