import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { getFlatSlides, presentation } from '../data/presentation.js';
import { getNotesForSlide } from '../data/notesLoader.js';
import { useSyncReceiver } from '../hooks/usePresentationSync.js';
import { usePresenterMode } from '../hooks/usePresenterMode.jsx';

function notesKey(slideId, buildStep) {
  return `presenter-notes-${slideId}-${buildStep}`;
}

function PresenterLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authenticate } = usePresenterMode();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const ok = await authenticate(password);
    if (!ok) {
      setError('Invalid password');
      setPassword('');
    }
  }

  return (
    <div className="presenter-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Presenter Mode</h2>
        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>Enter the presenter password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            padding: '0.6rem 1rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'inherit',
            marginRight: '0.5rem',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--accent, #6c5ce7)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
        {error && <p style={{ color: '#e84393', marginTop: '0.75rem' }}>{error}</p>}
      </form>
    </div>
  );
}

function PresenterContent() {
  const flatSlides = useMemo(() => getFlatSlides(presentation), []);
  const [state, setState] = useState({
    currentIndex: 0,
    buildStep: 0,
    totalSlides: flatSlides.length,
  });
  const [elapsed, setElapsed] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const textareaRef = useRef(null);
  const startTime = useRef(Date.now());
  const { token, logout } = usePresenterMode();

  const onStateUpdate = useCallback((data) => {
    setState(data);
  }, []);

  const { sendCommand } = useSyncReceiver(onStateUpdate);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation in presenter window sends commands to main window
  const currentSlide = flatSlides[state.currentIndex];

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL.replace(/\/$/, '');

    function handleKeyDown(e) {
      // Don't capture keyboard when editing notes
      if (editing) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          sendCommand('next');
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          sendCommand('prev');
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          if (currentSlide?.pollId && token) {
            fetch(`${apiBase}/api/poll/${currentSlide.pollId}/reset`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sendCommand, editing, currentSlide, token]);

  const nextSlide = flatSlides[state.currentIndex + 1];

  // Get notes: check localStorage for edits, fall back to file content
  const fileNotes = currentSlide
    ? getNotesForSlide(currentSlide.id, state.buildStep)
    : '';
  const storageKey = currentSlide ? notesKey(currentSlide.id, state.buildStep) : '';
  const savedNotes = storageKey ? localStorage.getItem(storageKey) : null;
  const notes = savedNotes !== null ? savedNotes : fileNotes;

  // When slide changes, exit edit mode
  useEffect(() => {
    setEditing(false);
  }, [state.currentIndex, state.buildStep]);

  function startEditing() {
    setEditText(notes);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function saveEdits() {
    // Save to localStorage as immediate cache
    if (editText === fileNotes) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, editText);
    }
    setEditing(false);

    // Also persist to the markdown file via the backend API (requires presenter auth)
    if (currentSlide && token) {
      try {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL.replace(/\/$/, '');
        await fetch(`${apiBase}/api/notes/${currentSlide.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            buildStep: state.buildStep,
            content: editText,
          }),
        });
      } catch {
        // API not available (e.g. production) — localStorage save is sufficient
      }
    }
  }

  function cancelEdits() {
    setEditing(false);
  }

  // Build the iframe URL to show the current slide at mobile size
  const iframeUrl = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?mode=preview`;
  }, []);

  // Send state to the preview iframe
  const iframeRef = useRef(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    function sendToIframe() {
      iframe.contentWindow?.postMessage({
        type: 'presenter-preview-state',
        currentIndex: state.currentIndex,
        buildStep: state.buildStep,
        totalSlides: state.totalSlides,
      }, '*');
    }
    // Send immediately and also when iframe loads
    sendToIframe();
    iframe.addEventListener('load', sendToIframe);
    return () => iframe.removeEventListener('load', sendToIframe);
  }, [state.currentIndex, state.buildStep, state.totalSlides]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="presenter-view">
      <div className="presenter-header">
        <div className="presenter-timer">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="presenter-slide-info">
          Slide {state.currentIndex + 1} / {state.totalSlides}
          {currentSlide?.buildSteps?.length > 0 && (
            <span className="presenter-build-info">
              {' '}(step {state.buildStep + 1}/{currentSlide.buildSteps.length})
            </span>
          )}
        </div>
        <div className="presenter-nav-buttons">
          <button onClick={() => sendCommand('prev')}>← Prev</button>
          <button onClick={() => sendCommand('next')}>Next →</button>
          <button onClick={logout} style={{ marginLeft: '1rem', opacity: 0.6 }}>Logout</button>
        </div>
      </div>

      <div className="presenter-body">
        {/* Left: mobile preview */}
        <div className="presenter-preview-col">
          <h3>Mobile Preview</h3>
          <div className="presenter-mobile-frame">
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              className="presenter-mobile-iframe"
              title="Mobile preview"
            />
          </div>
        </div>

        {/* Center: notes */}
        <div className="presenter-notes-col">
          <div className="presenter-notes-header">
            <h3>Notes</h3>
            {!editing ? (
              <button className="presenter-edit-btn" onClick={startEditing}>
                Edit
              </button>
            ) : (
              <div className="presenter-edit-actions">
                <button className="presenter-edit-btn presenter-edit-btn--save" onClick={saveEdits}>
                  Save
                </button>
                <button className="presenter-edit-btn" onClick={cancelEdits}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="presenter-notes-content" onDoubleClick={!editing ? startEditing : undefined}>
            {editing ? (
              <textarea
                ref={textareaRef}
                className="presenter-notes-editor"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <Markdown>{notes || '*(No notes)*'}</Markdown>
            )}
          </div>
        </div>

        {/* Right: next slide */}
        <div className="presenter-next-col">
          <h3>Up Next</h3>
          {nextSlide ? (
            <div className="presenter-slide-preview presenter-slide-preview--next">
              <div className="preview-section">{nextSlide.sectionTitle}</div>
              <div className="preview-title">{nextSlide.title || nextSlide.layout}</div>
            </div>
          ) : (
            <div className="presenter-slide-preview presenter-slide-preview--next">
              <div className="preview-title">End of presentation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PresenterView() {
  const { isPresenter } = usePresenterMode();

  if (!isPresenter) {
    return <PresenterLogin />;
  }

  return <PresenterContent />;
}
