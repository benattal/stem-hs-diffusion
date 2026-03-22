import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './GenAiDemoSlide.css';

function CodeBlock({ code, language }) {
  return (
    <div className="chat-code-block">
      {language && <div className="chat-code-lang">{language}</div>}
      <pre><code>{code}</code></pre>
    </div>
  );
}

function RichText({ text }) {
  // First split on ```lang\n...\n``` code blocks, then parse LaTeX in text segments
  const segments = [];
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'rich', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', language: match[1] || '', content: match[2] });
    lastIndex = codeRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'rich', content: text.slice(lastIndex) });
  }

  return (
    <>
      {segments.map((seg, si) => {
        if (seg.type === 'code') {
          return <CodeBlock key={si} code={seg.content} language={seg.language} />;
        }
        // Parse LaTeX in rich-text segments
        const parts = [];
        const latexRegex = /\$\$([\s\S]*?)\$\$|\$([\s\S]*?)\$/g;
        let li = 0;
        let lm;
        while ((lm = latexRegex.exec(seg.content)) !== null) {
          if (lm.index > li) {
            parts.push({ type: 'text', content: seg.content.slice(li, lm.index) });
          }
          if (lm[1] !== undefined) {
            parts.push({ type: 'display-math', content: lm[1] });
          } else {
            parts.push({ type: 'inline-math', content: lm[2] });
          }
          li = latexRegex.lastIndex;
        }
        if (li < seg.content.length) {
          parts.push({ type: 'text', content: seg.content.slice(li) });
        }
        return (
          <span key={si}>
            {parts.map((part, pi) => {
              if (part.type === 'text') {
                return <span key={pi}>{part.content}</span>;
              }
              const displayMode = part.type === 'display-math';
              const html = katex.renderToString(part.content, {
                displayMode,
                throwOnError: false,
              });
              return displayMode ? (
                <div key={pi} className="chat-latex-block" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <span key={pi} dangerouslySetInnerHTML={{ __html: html }} />
              );
            })}
          </span>
        );
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="typing-dots">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  );
}

function ChatMessage({ type, children, delay = 0 }) {
  return (
    <motion.div
      className={`chat-message chat-message--${type}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className={`chat-bubble chat-bubble--${type}`}>
        {children}
      </div>
    </motion.div>
  );
}

function ChatDemo({ demo, isVisible }) {
  const [phase, setPhase] = useState('typing'); // 'typing' | 'response'
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      setPhase('typing');
      timerRef.current = setTimeout(() => {
        setPhase('response');
      }, 1500);
      return () => clearTimeout(timerRef.current);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="chat-demo"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {demo.label && <div className="chat-demo-label">{demo.label}</div>}
      <div className="chat-window">
        <div className="chat-window-header">
          <span className="chat-window-dot" />
          <span className="chat-window-dot" />
          <span className="chat-window-dot" />
          <span className="chat-window-title">AI Chat</span>
        </div>
        <div className="chat-window-body">
          <ChatMessage type="user">
            {demo.userMessage}
          </ChatMessage>

          {phase === 'typing' && (
            <ChatMessage type="ai" delay={0.3}>
              <TypingDots />
            </ChatMessage>
          )}

          {phase === 'response' && (
            <ChatMessage type="ai" delay={0}>
              {demo.responseType === 'text' && (
                <div className="chat-response-text">
                  <RichText text={demo.responseText} />
                </div>
              )}
              {demo.responseType === 'image' && (
                <div className="chat-response-media">
                  <img
                    src={demo.mediaSrc}
                    alt="AI-generated"
                    className="generated-media generated-image"
                  />
                </div>
              )}
              {demo.responseType === 'video' && (
                <div className="chat-response-media">
                  <video
                    src={demo.mediaSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="generated-media generated-video"
                  />
                </div>
              )}
            </ChatMessage>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LogoBar({ logos, isVisible }) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="logo-bar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {logos.map((logo, i) => (
        <motion.div
          key={logo.name}
          className="logo-pill"
          style={{ '--logo-color': logo.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.2 }}
        >
          {logo.logo && (
            <img src={logo.logo} alt="" className="logo-pill-img" />
          )}
          {logo.name}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function GenAiDemoSlide({ slide, buildStep }) {
  const steps = slide.buildSteps || [];

  // Collect which step IDs and demo indices are visible
  const visibleStepIds = new Set();
  const visibleDemoIndices = new Set();

  for (let i = 0; i <= buildStep && i < steps.length; i++) {
    visibleStepIds.add(steps[i].id);
    if (steps[i].id === 'chatDemo' && steps[i].index !== undefined) {
      visibleDemoIndices.add(steps[i].index);
    }
  }

  return (
    <div className="slide--gen-ai-demo">
      <h2>{slide.title}</h2>
      {slide.subtitle && <p className="demo-subtitle">{slide.subtitle}</p>}

      <div className="demo-body">
        {/* Question */}
        <AnimatePresence>
          {visibleStepIds.has('question') && (
            <motion.div
              className="demo-question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="demo-question-icon">?</span>
              <span>{slide.question}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer */}
        <AnimatePresence>
          {visibleStepIds.has('answer') && (
            <motion.div
              className="demo-answer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="demo-answer-icon">A</span>
              <span>{slide.answer}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Demos */}
        {(slide.chatDemos || []).length > 0 && (
          <div className="chat-demos">
            {slide.chatDemos.map((demo, i) => (
              <ChatDemo
                key={i}
                demo={demo}
                isVisible={visibleDemoIndices.has(i)}
              />
            ))}
          </div>
        )}

        {/* Logo Bar */}
        <LogoBar
          logos={slide.logos || []}
          isVisible={visibleStepIds.has('logos')}
        />
      </div>
    </div>
  );
}
