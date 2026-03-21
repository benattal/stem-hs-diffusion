import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function ColabLinkSlide({ slide }) {
  return (
    <div className="slide--colab">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <motion.p
        className="colab-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {slide.description}
      </motion.p>

      <motion.div
        className="colab-link-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <a
          href={slide.colabUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="colab-button"
          onClick={(e) => e.stopPropagation()}
        >
          Open in Google Colab &#8599;
        </a>

        <div className="colab-qr">
          <QRCodeSVG value={slide.colabUrl} size={180} />
        </div>

        {slide.note && <div className="colab-note">{slide.note}</div>}
      </motion.div>
    </div>
  );
}
