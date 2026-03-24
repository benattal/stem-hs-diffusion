import { motion } from 'framer-motion';
import './IllustratedPointsSlide.css';

function Badge({ type }) {
  const isGood = type === 'check';
  return (
    <span className={`ip-badge ip-badge--${type}`}>
      {isGood ? '\u2713' : '\u2717'}
    </span>
  );
}

function MiniChat({ messages, badge }) {
  return (
    <div className="ip-minichat-wrapper">
      {badge && <Badge type={badge} />}
      <div className="ip-minichat">
        <div className="ip-minichat-header">
          <span className="ip-minichat-dot" />
          <span className="ip-minichat-dot" />
          <span className="ip-minichat-dot" />
        </div>
        <div className="ip-minichat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`ip-msg ip-msg--${msg.role}`}>
              <div className={`ip-msg-bubble ip-msg-bubble--${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageCompare({ fakeImg, realImg }) {
  return (
    <div className="ip-image-compare">
      <div className="ip-image-card">
        <Badge type="x" />
        <img src={fakeImg} alt="AI-generated" />
        <span className="ip-image-label">AI-generated</span>
      </div>
      <div className="ip-image-card">
        <Badge type="check" />
        <img src={realImg} alt="Real photo" />
        <span className="ip-image-label">Real photo</span>
      </div>
    </div>
  );
}

function PointVisual({ visual }) {
  if (visual.type === 'imageCompare') {
    return <ImageCompare fakeImg={visual.fakeImg} realImg={visual.realImg} />;
  }

  if (visual.type === 'chatCompare') {
    return (
      <div className="ip-chat-compare">
        <MiniChat messages={visual.bad.messages} badge="x" />
        <MiniChat messages={visual.good.messages} badge="check" />
      </div>
    );
  }

  if (visual.type === 'chatConversation') {
    return (
      <div className="ip-chat-conversation">
        <MiniChat messages={visual.messages} />
      </div>
    );
  }

  return null;
}

export default function IllustratedPointsSlide({ slide, buildStep }) {
  const points = slide.points || [];
  const visibleCount = buildStep + 1;

  return (
    <div className="slide--illustrated-points">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="ip-points">
        {points.map((point, i) => {
          if (i >= visibleCount) return null;
          return (
            <motion.div
              key={i}
              className="ip-point"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="ip-point-text">
                <span className="ip-point-number">{i + 1}</span>
                <span>{point.text}</span>
              </div>
              {point.visual && (
                <div className="ip-point-visual">
                  <PointVisual visual={point.visual} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
