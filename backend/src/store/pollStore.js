import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'polls.json');

// Runtime state: persisted data + transient SSE clients
const polls = {};

// Load persisted poll data from disk
function loadFromDisk() {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveToDisk() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  // Strip clients (non-serializable) before saving
  const serializable = {};
  for (const [id, poll] of Object.entries(polls)) {
    serializable[id] = { options: poll.options, counts: poll.counts };
  }
  writeFileSync(DATA_FILE, JSON.stringify(serializable, null, 2), 'utf-8');
}

// Restore persisted polls on startup
const saved = loadFromDisk();
for (const [id, data] of Object.entries(saved)) {
  polls[id] = { options: data.options, counts: data.counts, clients: new Set() };
}

export function getOrCreate(pollId, options = [], initialCounts) {
  if (!polls[pollId]) {
    polls[pollId] = {
      options,
      counts: initialCounts && initialCounts.length === options.length
        ? [...initialCounts]
        : new Array(options.length).fill(0),
      clients: new Set(),
    };
    saveToDisk();
  }
  return polls[pollId];
}

export function vote(pollId, optionIndex) {
  const poll = polls[pollId];
  if (!poll || optionIndex < 0 || optionIndex >= poll.counts.length) {
    return null;
  }
  poll.counts[optionIndex]++;
  saveToDisk();
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
  saveToDisk();
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
