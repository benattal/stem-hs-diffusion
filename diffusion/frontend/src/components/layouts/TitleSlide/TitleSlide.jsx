import { motion } from 'framer-motion';
import DiffusionCycleBackground from '../../shared/DiffusionCycleBackground.jsx';
import './TitleSlide.css';

export default function TitleSlide({ slide }) {
  return (
    <div className="slide--title">
      {slide.diffusionBackground ? (
        <DiffusionCycleBackground />
      ) : slide.background ? (
        <div
          className="title-bg"
          style={{ backgroundImage: `url(${slide.background})` }}
        />
      ) : null}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      {slide.subtitle && (
        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {slide.subtitle}
        </motion.p>
      )}
    </div>
  );
}
