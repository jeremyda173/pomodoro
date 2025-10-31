import { useMemo, useState } from 'react';
import WeeklyChart from './WeeklyChart';

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday=0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - diff);
    return d;
}

export default function Stats({ stats, onClear }) {
    const [selectedIdx, setSelectedIdx] = useState(((new Date().getDay() + 6) % 7));
    const start = useMemo(() => getStartOfWeek(new Date()), []);
    const dayStart = useMemo(() => new Date(start.getFullYear(), start.getMonth(), start.getDate() + selectedIdx), [start, selectedIdx]);
    const dayEnd = useMemo(() => new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1), [dayStart]);

    const daySessions = useMemo(() => (stats.sessions || []).filter((s) => {
        if (!s.completedAt) return false;
        const d = new Date(s.completedAt);
        return d >= dayStart && d < dayEnd;
    }), [stats.sessions, dayStart, dayEnd]);

    const workCount = daySessions.filter(s => s.type === 'work').length;
    const workMinutes = Math.round(daySessions.reduce((sum, s) => sum + (s.durationMs || 0), 0) / 60000);
	return (
		<div className="card">
			<div className="row space-between">
				<h3>Estadísticas</h3>
				<button className="btn subtle" onClick={onClear}>Borrar historial</button>
			</div>
            <WeeklyChart sessions={stats.sessions} selectedIndex={selectedIdx} onSelect={setSelectedIdx} />
            <div className="stats-counters">
				<div className="stat-card">
					<div className="stat-icon">✓</div>
					<div className="stat-value">{workCount}</div>
					<div className="stat-label">Sesiones completadas</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon">⏱</div>
					<div className="stat-value">{workMinutes}m</div>
					<div className="stat-label">Trabajo total</div>
				</div>
			</div>
			<div className="table-wrap">
				<table className="stats-table">
					<thead>
						<tr>
							<th>Tipo</th>
							<th>Duración</th>
							<th>Completado</th>
						</tr>
					</thead>
					<tbody>
                        {daySessions.slice(0, 20).map((s) => (
							<tr key={s.id}>
								<td>{s.type}</td>
								<td>{Math.round((s.durationMs || 0) / 60000)} min</td>
								<td>{formatDate(s.completedAt)}</td>
							</tr>
						))}
                        {daySessions.length === 0 && (
							<tr>
								<td colSpan={3} style={{ textAlign: 'center', opacity: 0.7 }}>Sin datos aún</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


