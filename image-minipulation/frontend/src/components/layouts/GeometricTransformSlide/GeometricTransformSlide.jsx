import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GeometricTransformSlide.css';

const GRID_SIZE = 5;
const CELL_SIZE = 60;
const GAP = 4;

function cellColor(index) {
  return `hsl(${(index * 360) / 25}, 60%, 35%)`;
}

function baseGrid() {
  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c;
      cells.push({
        id: idx,
        value: idx + 1,
        row: r,
        col: c,
        color: cellColor(idx),
        visible: true,
      });
    }
  }
  return cells;
}

function computeGrid(op) {
  const cells = baseGrid();
  switch (op) {
    case 0: return cells;
    case 1:
      return cells.map((cell) => {
        const inCrop = cell.row >= 1 && cell.row <= 3 && cell.col >= 1 && cell.col <= 3;
        return { ...cell, visible: inCrop, row: inCrop ? cell.row - 1 : cell.row, col: inCrop ? cell.col - 1 : cell.col };
      });
    case 2:
      return cells.map((cell) => ({ ...cell, row: cell.col, col: GRID_SIZE - 1 - cell.row }));
    case 3:
      return cells.map((cell) => ({ ...cell, col: GRID_SIZE - 1 - cell.col }));
    case 4:
      return cells.map((cell) => ({ ...cell, row: GRID_SIZE - 1 - cell.row }));
    default: return cells;
  }
}

function imageTransform(op) {
  switch (op) {
    case 1: return {};
    case 2: return { rotate: 90 };
    case 3: return { scaleX: -1 };
    case 4: return { scaleY: -1 };
    default: return {};
  }
}

const OPERATION_LABELS = {
  0: 'Original',
  1: 'Cropping',
  2: 'Rotate 90\u00b0 CW',
  3: 'Horizontal Flip',
  4: 'Vertical Flip',
};

export default function GeometricTransformSlide({ slide, buildStep = 0 }) {
  // Build steps:
  // 0 = original (show grid + label)
  // 1 = show "Cropping" label (grid still in original position)
  // 2 = animate crop
  // 3 = show "Rotate 90° CW" label (grid back to original)
  // 4 = animate rotation
  // 5 = show "Horizontal Flip" label (grid back to original)
  // 6 = animate horizontal flip
  // 7 = show "Vertical Flip" label (grid back to original)
  // 8 = animate vertical flip

  // Map buildStep to operation index and whether animation has fired
  let opIndex, animated;
  if (buildStep === 0) {
    opIndex = 0;
    animated = true; // original is always "shown"
  } else {
    // buildStep 1-2 = op 1, 3-4 = op 2, 5-6 = op 3, 7-8 = op 4
    opIndex = Math.ceil(buildStep / 2);
    animated = buildStep % 2 === 0; // even = animated, odd = paused
  }

  opIndex = Math.min(opIndex, 4);

  // When not yet animated, show the original grid but with the new label
  const gridOp = animated ? opIndex : 0;
  const imgOp = animated ? opIndex : 0;

  // Use instant transitions when resetting to original on label steps
  const useInstantTransition = !animated && buildStep > 0;

  const grid = useMemo(() => computeGrid(gridOp), [gridOp]);
  const imgTransform = imageTransform(imgOp);

  // Always keep grid container at full 5x5 size to prevent jumps
  const gridW = GRID_SIZE * (CELL_SIZE + GAP) - GAP;
  const gridH = GRID_SIZE * (CELL_SIZE + GAP) - GAP;

  const operationLabel =
    slide.operations && slide.operations[opIndex]
      ? slide.operations[opIndex].label
      : OPERATION_LABELS[opIndex];

  return (
    <div className="slide--geometric-transform">
      <motion.h2
        className="geo-transform__title"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="geo-transform__body">
        {/* Left: Image */}
        <motion.div
          className="geo-transform__image-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="geo-transform__image-wrapper">
            <motion.img
              src={slide.imageSrc}
              alt=""
              className="geo-transform__image"
              animate={imgTransform}
              transition={useInstantTransition
                ? { duration: 0 }
                : { type: 'spring', stiffness: 30, damping: 20, mass: 2 }
              }
            />

            <AnimatePresence>
              {gridOp === 1 && (
                <motion.div
                  className="geo-transform__crop-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="geo-transform__crop-hole" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: Grid */}
        <motion.div
          className="geo-transform__grid-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <motion.div
            className="geo-transform__op-label"
            key={opIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {operationLabel}
          </motion.div>

          <div
            className="geo-transform__grid"
            style={{ width: gridW, height: gridH }}
          >
            {grid.map((cell) => (
              <motion.div
                key={cell.id}
                className="geo-transform__cell"
                initial={false}
                animate={{
                  x: cell.col * (CELL_SIZE + GAP),
                  y: cell.row * (CELL_SIZE + GAP),
                  opacity: cell.visible ? 1 : 0,
                  scale: cell.visible ? 1 : 0.6,
                }}
                transition={useInstantTransition
                  ? { duration: 0, opacity: { duration: 0 } }
                  : {
                      type: 'spring',
                      stiffness: 25,
                      damping: 14,
                      mass: 2,
                      delay: cell.id * 0.03,
                      opacity: { duration: 0.6, delay: cell.id * 0.03 },
                    }
                }
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: cell.color,
                  position: 'absolute',
                }}
              >
                {cell.value}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
