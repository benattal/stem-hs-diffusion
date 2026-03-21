// In-memory poll storage
const polls = {};

export function getOrCreate(pollId, options = []) {
  if (!polls[pollId]) {
    polls[pollId] = {
      options,
      counts: new Array(options.length).fill(0),
      clients: new Set(),
    };
  }
  return polls[pollId];
}

export function vote(pollId, optionIndex) {
  const poll = polls[pollId];
  if (!poll || optionIndex < 0 || optionIndex >= poll.counts.length) {
    return null;
  }
  poll.counts[optionIndex]++;
  broadcast(pollId);
  return poll.counts;
}

export function getCounts(pollId) {
  const poll = polls[pollId];
  if (!poll) return null;
  return { options: poll.options, counts: poll.counts };
}

export function subscribe(pollId, res) {
  const poll = polls[pollId];
  if (poll) poll.clients.add(res);
}

export function unsubscribe(pollId, res) {
  const poll = polls[pollId];
  if (poll) poll.clients.delete(res);
}

export function reset(pollId) {
  const poll = polls[pollId];
  if (!poll) return null;
  poll.counts = new Array(poll.options.length).fill(0);
  broadcast(pollId);
  return poll.counts;
}

function broadcast(pollId) {
  const poll = polls[pollId];
  if (!poll) return;
  const data = JSON.stringify({ options: poll.options, counts: poll.counts });
  for (const client of poll.clients) {
    client.write(`data: ${data}\n\n`);
  }
}
