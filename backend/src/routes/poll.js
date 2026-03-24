import { Router } from 'express';
import { getOrCreate, vote, getCounts, subscribe, unsubscribe, reset } from '../store/pollStore.js';
import { requirePresenter } from './auth.js';

const router = Router();

// Get current poll state
router.get('/:pollId', (req, res) => {
  const { pollId } = req.params;
  const data = getCounts(pollId);
  if (!data) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(data);
});

// Initialize a poll (idempotent)
router.post('/:pollId/init', (req, res) => {
  const { pollId } = req.params;
  const { options, initialCounts } = req.body;
  if (!options || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: 'options array required' });
  }
  const poll = getOrCreate(pollId, options, initialCounts);
  res.json({ options: poll.options, counts: poll.counts });
});

// Submit a vote (optionally changing a previous vote)
router.post('/:pollId/vote', (req, res) => {
  const { pollId } = req.params;
  const { optionIndex, previousIndex } = req.body;
  if (typeof optionIndex !== 'number') {
    return res.status(400).json({ error: 'optionIndex (number) required' });
  }
  const counts = vote(pollId, optionIndex, previousIndex);
  if (!counts) {
    return res.status(404).json({ error: 'Poll not found or invalid option' });
  }
  res.json({ counts });
});

// SSE stream for live updates
router.get('/:pollId/stream', (req, res) => {
  const { pollId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send current state immediately
  const data = getCounts(pollId);
  if (data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  subscribe(pollId, res);

  req.on('close', () => {
    unsubscribe(pollId, res);
  });
});

// Reset a poll (presenter use — requires auth)
router.post('/:pollId/reset', requirePresenter, (req, res) => {
  const { pollId } = req.params;
  const counts = reset(pollId);
  if (!counts) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json({ counts });
});

export default router;
