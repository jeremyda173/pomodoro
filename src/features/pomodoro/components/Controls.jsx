export default function Controls({ isRunning, onStart, onPause, onReset, onNext }) {
	return (
		<div className="controls btn-group">
			{!isRunning ? (
				<button className="btn btn--lg btn--primary" onClick={onStart}>Iniciar</button>
			) : (
				<button className="btn btn--lg btn--secondary" onClick={onPause}>Pausar</button>
			)}
			<button className="btn btn--lg btn--ghost" onClick={onReset}>Reiniciar</button>
			<button className="btn btn--lg btn--ghost" onClick={onNext}>Siguiente fase</button>
		</div>
	);
}


