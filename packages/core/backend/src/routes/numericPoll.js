import { Router } from 'express';
import { getOrCreate, submit, getValues, subscribe, unsubscribe, reset } from '../store/numericPollStore.js';
import { requirePresenter } from './auth.js';

const router = Router();

// Get current values
router.get('/:pollId', (req, res) => {
  const values = getValues(req.params.pollId);
  if (values === null) return res.json({ values: [] });
  res.json({ values });
});

// Initialize (idempotent)
router.post('/:pollId/init', (req, res) => {
  const poll = getOrCreate(req.params.pollId);
  res.json({ values: poll.values });
});

// Submit a number
router.post('/:pollId/submit', (req, res) => {
  if (process.env.VOTING_DISABLED === 'true') {
    return res.status(403).json({ error: 'Voting is currently disabled' });
  }
  const { value } = req.body;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return res.status(400).json({ error: 'value (number) required' });
  }
  const values = submit(req.params.pollId, value);
  res.json({ values });
});

// SSE stream
router.get('/:pollId/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const values = getValues(req.params.pollId);
  if (values !== null) {
    res.write(`data: ${JSON.stringify({ values })}\n\n`);
  }
  subscribe(req.params.pollId, res);
  req.on('close', () => unsubscribe(req.params.pollId, res));
});

// Reset (presenter only)
router.post('/:pollId/reset', requirePresenter, (req, res) => {
  const values = reset(req.params.pollId);
  if (values === null) return res.status(404).json({ error: 'Poll not found' });
  res.json({ values });
});

export default router;
