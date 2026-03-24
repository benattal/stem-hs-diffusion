export const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4 },
  },
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  zoom: {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.5 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 },
  },
};

/**
 * Pick the right transition variant based on slide config and navigation direction.
 * @param {string} transitionName - The transition type from slide data
 * @param {number} direction - 1 for forward, -1 for backward
 */
export function getTransition(transitionName = 'fade', direction = 1) {
  if (transitionName === 'slide') {
    return direction > 0
      ? transitionVariants.slideLeft
      : transitionVariants.slideRight;
  }
  return transitionVariants[transitionName] || transitionVariants.fade;
}
