# Temporizador Pomodoro (React + Vite)

Aplicación de productividad con temporizador Pomodoro, notificaciones del navegador, sonido mediante Web Audio API y estadísticas persistidas en LocalStorage.

## Características

- Trabajo/Descansos configurables (corto y largo)
- Inicio automático opcional de la siguiente fase
- Notificaciones nativas al finalizar cada fase
- Sonido de finalización (Web Audio API)
- Persistencia de configuración y estadísticas (LocalStorage)
- Historial de sesiones y totales de tiempo

## Scripts

- `npm install` — instala dependencias
- `npm run dev` — modo desarrollo
- `npm run build` — produce build de producción
- `npm run preview` — previsualiza el build

## Permisos de notificaciones

La app solicitará permiso de notificaciones. Si las bloqueas, puedes habilitarlas desde la configuración del navegador.

## Sonido

Los navegadores requieren interacción del usuario para iniciar audio. El primer click en “Iniciar” habilita el contexto de audio.

## Estructura

- `src/hooks/usePomodoro.js` — lógica del temporizador y fases
- `src/hooks/useLocalStorage.js` — helper de persistencia
- `src/lib/notifications.js` — permisos y envío de notificaciones
- `src/lib/soundManager.js` — tono/chime de finalización (Web Audio)
- `src/components/*` — UI (Timer, Controls, Settings, Stats)
