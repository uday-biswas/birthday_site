type Payload = Record<string, any>;

const SESSION_KEY = "bday_session_id";
const ENDPOINT = import.meta.env.VITE_SHEETS_LOG_URL as string;
const SECRET = import.meta.env.VITE_SHEETS_LOG_SECRET as string;

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function logEvent(event: string, payload: Payload = {}) {
  try {
    if (!ENDPOINT || !SECRET) return;

    const sessionId = getSessionId();

    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: JSON.stringify({
        secret: SECRET,
        ts: new Date().toISOString(),
        sessionId,
        event,
        payload,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    });
  } catch {
    // never block UX
  }
}