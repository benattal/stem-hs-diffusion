import { motion } from 'framer-motion';
import './DiscussionSlide.css';

export default function DiscussionSlide({ slide }) {
  return (
    <div className="slide--discussion">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="discussion-prompts">
        {slide.prompts.map((prompt, i) => (
          <motion.div
            key={i}
            className="discussion-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
          >
            <span className="prompt-number">{i + 1}</span>
            {prompt}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
