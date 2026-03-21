import { motion } from 'framer-motion';

export default function DiscussionSlide({ slide }) {
  return (
    <div className="slide--discussion">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="discussion-prompts">
        {slide.prompts.map((prompt, i) => (
          <motion.div
            key={i}
            className="discussion-prompt"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
