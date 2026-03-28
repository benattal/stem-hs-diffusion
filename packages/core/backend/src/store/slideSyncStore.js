// In-memory slide position state with SSE pub/sub (per presentation)
const presentations = {};

function getOrCreate(presentationId) {
  if (!presentations[presentationId]) {
    presentations[presentationId] = {
      currentIndex: 0,
      buildStep: 0,
      clients: new Set(),
    };
  }
  return presentations[presentationId];
}

export function getState(presentationId) {
  const p = presentations[presentationId];
  if (!p) return { currentIndex: 0, buildStep: 0 };
  return { currentIndex: p.currentIndex, buildStep: p.buildStep };
}

export function updatePosition(presentationId, currentIndex, buildStep) {
  const p = getOrCreate(presentationId);
  p.currentIndex = currentIndex;
  p.buildStep = buildStep;
  broadcast(presentationId);
}

export function subscribe(presentationId, res) {
  const p = getOrCreate(presentationId);
  p.clients.add(res);
}

export function unsubscribe(presentationId, res) {
  const p = presentations[presentationId];
  if (p) p.clients.delete(res);
}

function broadcast(presentationId) {
  const p = presentations[presentationId];
  if (!p) return;
  const data = JSON.stringify({ currentIndex: p.currentIndex, buildStep: p.buildStep });
  for (const client of p.clients) {
    client.write(`data: ${data}\n\n`);
  }
}
