export async function ensureNotificationPermission() {
	if (!('Notification' in window)) return 'unsupported';
	if (Notification.permission === 'granted') return 'granted';
	if (Notification.permission === 'denied') return 'denied';
	try {
		const result = await Notification.requestPermission();
		return result;
	} catch {
		return Notification.permission;
	}
}

export function notify(title, options) {
	if (!('Notification' in window)) return;
	if (Notification.permission !== 'granted') return;
	try {
		new Notification(title, options);
	} catch {
		/* best-effort */
	}
}


