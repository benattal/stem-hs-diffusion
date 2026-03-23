import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './GenAiOverviewSlide.css';

function TypingDots() {
  return (
    <span className="gao-typing-dots">
      <span className="gao-dot" />
      <span className="gao-dot" />
      <span className="gao-dot" />
    </span>
  );
}

function MiniChatWindow({ demo, label, isVisible }) {
  const [phase, setPhase] = useState(isVisible ? 'typing' : 'idle');

  useEffect(() => {
    if (!isVisible) return;
    setPhase('typing');
    const timer = setTimeout(() => setPhase('response'), 1200);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <div className="gao-chat-card">
      <div className="gao-chat-type-label">{label}</div>
      <div className="gao-chat-window">
        <div className="gao-chat-header">
          <span className="gao-chat-dot" />
          <span className="gao-chat-dot" />
          <span className="gao-chat-dot" />
          <span className="gao-chat-title">AI Chat</span>
        </div>
        <div className="gao-chat-body">
          <div className="gao-msg gao-msg--user">
            <div className="gao-bubble gao-bubble--user">{demo.userMessage}</div>
          </div>
          {phase === 'typing' && (
            <div className="gao-msg gao-msg--ai">
              <div className="gao-bubble gao-bubble--ai">
                <TypingDots />
              </div>
            </div>
          )}
          {phase === 'response' && (
            <div className="gao-msg gao-msg--ai">
              <div className="gao-bubble gao-bubble--ai">
                {demo.responseType === 'text' && (
                  <div className="gao-response-text">{demo.responseText}</div>
                )}
                {demo.responseType === 'image' && (
                  <img src={demo.mediaSrc} alt="" className="gao-response-media gao-deblur" />
                )}
                {demo.responseType === 'video' && (
                  <video src={demo.mediaSrc} autoPlay muted loop playsInline className="gao-response-media gao-deblur" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GenAiOverviewSlide({ slide, buildStep }) {
  const outputs = slide.outputs || [];

  return (
    <div className="slide--gen-ai-overview">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <motion.p
        className="gao-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {slide.subtitle}
      </motion.p>

      {/* Flow diagram */}
      {buildStep >= 0 && (
        <motion.div
          className="gao-flow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="gao-flow-box gao-flow-input">Text</div>
          <div className="gao-flow-arrow">&rarr;</div>
          <div className="gao-flow-box gao-flow-model">AI Model</div>
          <div className="gao-flow-arrow">&rarr;</div>
          <div className="gao-flow-box gao-flow-output">New Content</div>
        </motion.div>
      )}

      {/* Chat examples — all always rendered for stable layout */}
      <div className="gao-demos">
        {outputs.map((output, i) => {
          const visible = buildStep >= i + 1;
          return (
            <div
              key={i}
              className="gao-demo-slot"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s' }}
            >
              <MiniChatWindow demo={output} label={output.label} isVisible={visible} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
