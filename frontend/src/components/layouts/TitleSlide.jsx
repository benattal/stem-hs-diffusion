import { motion } from 'framer-motion';

export default function TitleSlide({ slide }) {
  return (
    <div className="slide--title">
      {slide.background && (
        <div
          className="title-bg"
          style={{ backgroundImage: `url(${slide.background})` }}
        />
      )}
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      {slide.subtitle && (
        <motion.p
          className="subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {slide.subtitle}
        </motion.p>
      )}
    </div>
  );
}
