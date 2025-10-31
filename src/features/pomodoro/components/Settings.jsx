export default function Settings({ settings, setSetting }) {
	return (
		<div className="card">
			<h3>Configuración</h3>
			<div className="grid two">
				<label>
					<span>Trabajo (min)</span>
					<input type="number" min="1" max="90" value={settings.workMinutes}
						onChange={(e) => setSetting('workMinutes', Number(e.target.value) || 1)} />
				</label>
				<label>
					<span>Descanso corto (min)</span>
					<input type="number" min="1" max="60" value={settings.shortBreakMinutes}
						onChange={(e) => setSetting('shortBreakMinutes', Number(e.target.value) || 1)} />
				</label>
				<label>
					<span>Descanso largo (min)</span>
					<input type="number" min="1" max="60" value={settings.longBreakMinutes}
						onChange={(e) => setSetting('longBreakMinutes', Number(e.target.value) || 1)} />
				</label>
				<label>
					<span>Intervalos antes del largo</span>
					<input type="number" min="1" max="10" value={settings.intervalsBeforeLongBreak}
						onChange={(e) => setSetting('intervalsBeforeLongBreak', Math.max(1, Number(e.target.value) || 1))} />
				</label>
			</div>
			<div className="settings-toggles">
				<label className="toggle-row">
					<div className="toggle-info">
						<span className="toggle-label">Auto iniciar siguiente fase</span>
						<span className="toggle-desc">Inicia automáticamente la siguiente fase al completar</span>
					</div>
					<label className="toggle-switch">
						<input type="checkbox" checked={settings.autoStartNext}
							onChange={(e) => setSetting('autoStartNext', e.target.checked)} />
						<span className="toggle-slider"></span>
					</label>
				</label>
				<label className="toggle-row">
					<div className="toggle-info">
						<span className="toggle-label">Sonido al finalizar</span>
						<span className="toggle-desc">Reproduce un sonido cuando la fase termine</span>
					</div>
					<label className="toggle-switch">
						<input type="checkbox" checked={settings.soundEnabled}
							onChange={(e) => setSetting('soundEnabled', e.target.checked)} />
						<span className="toggle-slider"></span>
					</label>
				</label>
			</div>
		</div>
	);
}


