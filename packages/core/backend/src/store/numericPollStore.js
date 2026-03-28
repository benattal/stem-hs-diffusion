// In-memory store for numeric (free-entry) polls
const polls = {};

export function getOrCreate(pollId) {
  if (!polls[pollId]) {
    polls[pollId] = { values: [], clients: new Set() };
  }
  return polls[pollId];
}

export function submit(pollId, value) {
  const poll = getOrCreate(pollId);
  poll.values.push(value);
  broadcast(pollId);
  return poll.values;
}

export function getValues(pollId) {
  const poll = polls[pollId];
  return poll ? poll.values : null;
}

export function subscribe(pollId, res) {
  getOrCreate(pollId).clients.add(res);
}

export function unsubscribe(pollId, res) {
  const poll = polls[pollId];
  if (poll) poll.clients.delete(res);
}

export function reset(pollId) {
  const poll = polls[pollId];
  if (!poll) return null;
  poll.values = [];
  broadcast(pollId, 'reset');
  return poll.values;
}

function broadcast(pollId, event) {
  const poll = polls[pollId];
  if (!poll) return;
  const data = JSON.stringify({ values: poll.values, event: event || 'update' });
  for (const client of poll.clients) {
    client.write(`data: ${data}\n\n`);
  }
}
