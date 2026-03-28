import { Router } from 'express';
import { getState, updatePosition, subscribe, unsubscribe } from '../store/slideSyncStore.js';
import { requirePresenter } from './auth.js';

const router = Router();

// SSE stream for slide position updates
router.get('/:presentationId/stream', (req, res) => {
  if (process.env.PRESENTER_CONTROLLED !== 'true') {
    return res.status(404).json({ error: 'Presenter-controlled mode is not enabled' });
  }

  const { presentationId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send current position immediately
  const state = getState(presentationId);
  res.write(`data: ${JSON.stringify(state)}\n\n`);

  subscribe(presentationId, res);

  req.on('close', () => {
    unsubscribe(presentationId, res);
  });
});

// Presenter updates slide position
router.post('/:presentationId/position', requirePresenter, (req, res) => {
  if (process.env.PRESENTER_CONTROLLED !== 'true') {
    return res.status(404).json({ error: 'Presenter-controlled mode is not enabled' });
  }

  const { presentationId } = req.params;
  const { currentIndex, buildStep } = req.body;

  if (typeof currentIndex !== 'number' || typeof buildStep !== 'number') {
    return res.status(400).json({ error: 'currentIndex and buildStep (numbers) required' });
  }

  updatePosition(presentationId, currentIndex, buildStep);
  res.json({ ok: true });
});

export default router;
