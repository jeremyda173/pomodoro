import { useEffect, useRef, useState } from 'react';

export function useLocalStorage(key, initialValue) {
	const isMountedRef = useRef(false);
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item !== null ? JSON.parse(item) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		if (!isMountedRef.current) {
			isMountedRef.current = true;
			return;
		}
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch {
			/* ignore quota or serialization errors */
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue];
}


