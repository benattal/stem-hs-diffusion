import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import './ColabLinkSlide.css';

const PLACEHOLDER_URL = 'https://stem-hs-diffusion-production.up.railway.app/';

export default function ColabLinkSlide({ slide }) {
  return (
    <div className="slide--colab">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span className="colab-button colab-button--disabled">
          Google Colab — Link Coming Soon
        </span>

        <div className="colab-qr">
          <QRCodeSVG value={PLACEHOLDER_URL} size={180} />
        </div>

        {slide.note && <div className="colab-note">{slide.note}</div>}
      </motion.div>
    </div>
  );
}
