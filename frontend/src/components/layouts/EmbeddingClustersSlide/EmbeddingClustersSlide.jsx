import { motion } from 'framer-motion';
import EmbeddingScatterPlot from '../EmbeddingSpaceSlide/EmbeddingScatterPlot.jsx';
import { embeddingPairs } from '../EmbeddingSpaceSlide/embeddingData.js';
import './EmbeddingClustersSlide.css';

const PLOT_W = 520;
const PLOT_H = 420;
const PAD = 30;

function toSvgX(x) { return PAD + x * (PLOT_W - 2 * PAD); }
function toSvgY(y) { return PAD + y * (PLOT_H - 2 * PAD); }

// Cluster definitions with representative image
const clusters = [
  {
    id: 'animals',
    label: 'Animals',
    color: '#6bcb77',
    members: ['cat', 'dog', 'kitten', 'puppy'],
    repId: 'cat',
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    color: '#339af0',
    members: ['car', 'airplane', 'bicycle'],
    repId: 'car',
  },
  {
    id: 'nature',
    label: 'Nature',
    color: '#20c997',
    members: ['mountain', 'ocean', 'forest', 'flower'],
    repId: 'mountain',
  },
  {
    id: 'food',
    label: 'Food',
    color: '#ffd93d',
    members: ['pizza', 'cake', 'sushi'],
    repId: 'pizza',
  },
  {
    id: 'people',
    label: 'People',
    color: '#f06595',
    members: ['astronaut', 'artist'],
    repId: 'astronaut',
  },
];

function getClusterGeometry(cluster) {
  const points = cluster.members
    .map((id) => embeddingPairs.find((p) => p.id === id))
    .filter(Boolean);

  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  let maxDist = 0;
  for (const p of points) {
    const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    if (d > maxDist) maxDist = d;
  }

  return {
    cx: toSvgX(cx),
    cy: toSvgY(cy),
    normCx: cx,
    normCy: cy,
    r: maxDist * (PLOT_W - 2 * PAD) + 18,
  };
}

// Distance lines with explicit label offsets to avoid overlap
const distanceLines = [
  { from: 'animals', to: 'vehicles', label: 'Different concepts', offsetX: -55, offsetY: -20 },
  { from: 'food', to: 'nature', label: 'Different concepts', offsetX: 55, offsetY: 20 },
];

const THUMB = 30;

function ClusterOverlays({ visible }) {
  if (!visible) return null;

  return (
    <>
      {clusters.map((cluster, i) => {
        const geo = getClusterGeometry(cluster);
        const rep = embeddingPairs.find((p) => p.id === cluster.repId);

        // Place label + thumbnail above the cluster circle
        const labelY = geo.cy - geo.r - 8;
        // Place thumbnail to the right of the label
        const thumbX = geo.cx + 30;
        const thumbY = labelY - THUMB + 4;

        return (
          <motion.g
            key={cluster.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            style={{ transformOrigin: `${geo.cx}px ${geo.cy}px` }}
          >
            {/* Circle */}
            <circle
              cx={geo.cx}
              cy={geo.cy}
              r={geo.r}
              fill={`${cluster.color}10`}
              stroke={cluster.color}
              strokeWidth={2}
              strokeDasharray="6 3"
            />

            {/* Label */}
            <text
              x={geo.cx}
              y={labelY}
              textAnchor="middle"
              fill={cluster.color}
              fontSize={12}
              fontWeight="700"
              fontFamily="var(--font)"
            >
              {cluster.label}
            </text>

            {/* Representative thumbnail */}
            {rep && (
              <>
                <rect
                  x={thumbX - 1}
                  y={thumbY - 1}
                  width={THUMB + 2}
                  height={THUMB + 2}
                  rx={4}
                  fill="none"
                  stroke={cluster.color}
                  strokeWidth={1.5}
                />
                <image
                  href={rep.image}
                  x={thumbX}
                  y={thumbY}
                  width={THUMB}
                  height={THUMB}
                  clipPath="inset(0 round 3px)"
                  preserveAspectRatio="xMidYMid slice"
                />
              </>
            )}
          </motion.g>
        );
      })}
    </>
  );
}

function DistanceOverlays({ visible }) {
  if (!visible) return null;

  return (
    <>
      {distanceLines.map((line, i) => {
        const fromGeo = getClusterGeometry(clusters.find((c) => c.id === line.from));
        const toGeo = getClusterGeometry(clusters.find((c) => c.id === line.to));
        const midX = (fromGeo.cx + toGeo.cx) / 2 + line.offsetX;
        const midY = (fromGeo.cy + toGeo.cy) / 2 + line.offsetY;
        const labelW = 88;

        return (
          <motion.g
            key={`${line.from}-${line.to}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.3 }}
          >
            <line
              x1={fromGeo.cx}
              y1={fromGeo.cy}
              x2={toGeo.cx}
              y2={toGeo.cy}
              stroke="#ff6b6b"
              strokeWidth={1.5}
              strokeDasharray="8 4"
            />
            <rect
              x={midX - labelW / 2}
              y={midY - 9}
              width={labelW}
              height={18}
              rx={4}
              fill="var(--bg-slide)"
              fillOpacity={0.95}
              stroke="#ff6b6b"
              strokeWidth={0.5}
            />
            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              fill="#ff6b6b"
              fontSize={9}
              fontWeight="700"
              fontFamily="var(--font)"
            >
              {line.label}
            </text>
          </motion.g>
        );
      })}
    </>
  );
}

export default function EmbeddingClustersSlide({ slide, buildStep }) {
  const showClusters = buildStep >= 1;
  const showDistances = buildStep >= 2;

  return (
    <div className="slide--embedding-clusters">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="ec-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      <motion.div
        className="ec-plot-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="ec-plot-svg">
          <EmbeddingScatterPlot
            pairs={embeddingPairs}
            activeId={null}
            onHover={() => {}}
            width={PLOT_W}
            height={PLOT_H}
          />
          <ClusterOverlays visible={showClusters} />
          <DistanceOverlays visible={showDistances} />
        </svg>
      </motion.div>

      <div className="ec-caption">
        {showClusters && !showDistances && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="ec-caption-text"
          >
            Similar concepts cluster together in the number space
          </motion.p>
        )}
        {showDistances && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="ec-caption-text"
          >
            Concepts we judge as different are also far apart in this space
          </motion.p>
        )}
      </div>
    </div>
  );
}
