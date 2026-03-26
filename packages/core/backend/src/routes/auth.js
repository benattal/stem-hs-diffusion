import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

const PRESENTER_PASSWORD = 'compimaging';

export function generateToken(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const VALID_TOKEN = generateToken(PRESENTER_PASSWORD);

/** Verify a password and return a token */
router.post('/verify', (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password required' });
  }

  const token = generateToken(password);
  if (token === VALID_TOKEN) {
    return res.json({ ok: true, token });
  }
  return res.status(401).json({ ok: false, error: 'Invalid password' });
});

/** Middleware: require presenter token for protected routes */
export function requirePresenter(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Presenter authentication required' });
  }
  const token = auth.slice(7);
  if (token !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Invalid presenter token' });
  }
  next();
}

export default router;
