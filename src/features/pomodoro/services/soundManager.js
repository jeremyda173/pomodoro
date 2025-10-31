let audioContext;

export function initAudio() {
	if (audioContext) return audioContext;
	try {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		return audioContext;
	} catch {
		return undefined;
	}
}

export function playBeep({ durationMs = 300, frequency = 880, volume = 0.1 } = {}) {
	const ctx = initAudio();
	if (!ctx) return;
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();
	oscillator.type = 'sine';
	oscillator.frequency.value = frequency;
	gain.gain.value = volume;
	oscillator.connect(gain);
	gain.connect(ctx.destination);
	oscillator.start();
	setTimeout(() => {
		oscillator.stop();
		oscillator.disconnect();
		gain.disconnect();
	}, durationMs);
}

export function playEndChime() {
	playBeep({ durationMs: 180, frequency: 660, volume: 0.12 });
	setTimeout(() => playBeep({ durationMs: 220, frequency: 520, volume: 0.12 }), 200);
}


