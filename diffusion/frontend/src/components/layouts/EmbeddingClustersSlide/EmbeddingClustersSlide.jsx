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

const THUMB = 30;

function ClusterOverlays({ visible, highlightIds }) {
  if (!visible) return null;

  return (
    <>
      {clusters.map((cluster, i) => {
        const geo = getClusterGeometry(cluster);
        const rep = embeddingPairs.find((p) => p.id === cluster.repId);

        const isHighlighted = !highlightIds || highlightIds.includes(cluster.id);
        const hasHighlight = !!highlightIds;

        // Place label + thumbnail above the cluster circle
        const labelY = geo.cy - geo.r - 8;
        // Place thumbnail to the right of the label
        const thumbX = geo.cx + 30;
        const thumbY = labelY - THUMB + 4;

        return (
          <motion.g
            key={cluster.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: hasHighlight ? (isHighlighted ? 1 : 0.15) : 1,
              scale: 1,
            }}
            transition={{ duration: 0.5, delay: hasHighlight ? 0 : i * 0.15 }}
            style={{ transformOrigin: `${geo.cx}px ${geo.cy}px` }}
          >
            {/* Circle */}
            <circle
              cx={geo.cx}
              cy={geo.cy}
              r={geo.r}
              fill={`${cluster.color}${hasHighlight && isHighlighted ? '22' : '10'}`}
              stroke={cluster.color}
              strokeWidth={hasHighlight && isHighlighted ? 3 : 2}
              strokeDasharray={hasHighlight && isHighlighted ? 'none' : '6 3'}
            />

            {/* Label */}
            <text
              x={geo.cx}
              y={labelY}
              textAnchor="middle"
              fill={cluster.color}
              fontSize={hasHighlight && isHighlighted ? 13 : 12}
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

const MEMBER_THUMB = 44;

function ClusterMemberThumbnails({ visible, clusterId }) {
  if (!visible) return null;

  const cluster = clusters.find(c => c.id === clusterId);
  if (!cluster) return null;

  const memberPairs = cluster.members
    .filter(id => id !== cluster.repId)
    .map(id => embeddingPairs.find(p => p.id === id))
    .filter(Boolean);

  return (
    <>
      {memberPairs.map((pair, i) => {
        const px = toSvgX(pair.x);
        const py = toSvgY(pair.y);
        // Offset the thumbnail so it sits above-right of the dot
        const tx = px + 6;
        const ty = py - MEMBER_THUMB - 6;

        return (
          <motion.g
            key={pair.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: `${px}px ${py}px` }}
          >
            {/* Connecting line from dot to thumbnail */}
            <line
              x1={px}
              y1={py}
              x2={tx + MEMBER_THUMB / 2}
              y2={ty + MEMBER_THUMB}
              stroke={cluster.color}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            {/* Border */}
            <rect
              x={tx - 1.5}
              y={ty - 1.5}
              width={MEMBER_THUMB + 3}
              height={MEMBER_THUMB + 3}
              rx={5}
              fill="var(--bg-card, #1e1e30)"
              stroke={cluster.color}
              strokeWidth={2}
            />
            {/* Image */}
            <image
              href={pair.image}
              x={tx}
              y={ty}
              width={MEMBER_THUMB}
              height={MEMBER_THUMB}
              clipPath="inset(0 round 4px)"
              preserveAspectRatio="xMidYMid slice"
            />
          </motion.g>
        );
      })}
    </>
  );
}

function ImageDifferenceOverlay() {
  const catPair = embeddingPairs.find(p => p.id === 'cat');
  const carPair = embeddingPairs.find(p => p.id === 'car');
  const animalCluster = clusters.find(c => c.id === 'animals');
  const vehicleCluster = clusters.find(c => c.id === 'vehicles');

  return (
    <motion.div
      className="ec-image-overlay"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="ec-overlay-title">These images are different!</div>
      <div className="ec-overlay-compare">
        <motion.div
          className="ec-overlay-item"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <img src={catPair.image} alt={catPair.caption} className="ec-overlay-img" />
          <span className="ec-overlay-cluster-label" style={{ color: animalCluster.color }}>
            {animalCluster.label}
          </span>
        </motion.div>
        <span className="ec-overlay-vs">&ne;</span>
        <motion.div
          className="ec-overlay-item"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <img src={carPair.image} alt={carPair.caption} className="ec-overlay-img" />
          <span className="ec-overlay-cluster-label" style={{ color: vehicleCluster.color }}>
            {vehicleCluster.label}
          </span>
        </motion.div>
      </div>
      <div className="ec-overlay-note">Far apart in the number space</div>
    </motion.div>
  );
}

function ImageSimilarityOverlay() {
  const animalCluster = clusters.find(c => c.id === 'animals');
  const animalPairs = animalCluster.members
    .map(id => embeddingPairs.find(p => p.id === id))
    .filter(Boolean);

  return (
    <motion.div
      className="ec-image-overlay ec-image-overlay--similarity"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="ec-overlay-title" style={{ color: animalCluster.color }}>
        These images are similar!
      </div>
      <div className="ec-overlay-gallery">
        {animalPairs.map((pair, i) => (
          <motion.div
            key={pair.id}
            className="ec-overlay-gallery-item"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
          >
            <img src={pair.image} alt={pair.caption} className="ec-overlay-img" />
            <span className="ec-overlay-img-caption">{pair.caption}</span>
          </motion.div>
        ))}
      </div>
      <div className="ec-overlay-note" style={{ color: animalCluster.color }}>
        All from the {animalCluster.label} cluster — close together in the number space
      </div>
    </motion.div>
  );
}

export default function EmbeddingClustersSlide({ slide, buildStep }) {
  const showClusters = buildStep >= 1;
  const showImageDifference = buildStep === 2;
  const showImageSimilarity = buildStep === 3;

  // Determine which clusters to highlight
  const highlightIds = showImageDifference
    ? ['animals', 'vehicles']
    : showImageSimilarity
      ? ['animals']
      : null;

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

      <div className="ec-columns">
        <div className="ec-col-graph">
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
              <ClusterOverlays visible={showClusters} highlightIds={highlightIds} />
              <ClusterMemberThumbnails visible={showImageSimilarity} clusterId="animals" />
            </svg>
          </motion.div>

          <div className="ec-caption">
            {showClusters && !showImageDifference && !showImageSimilarity && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="ec-caption-text"
              >
                Similar concepts cluster together in the number space
              </motion.p>
            )}
            {showImageDifference && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="ec-caption-text"
              >
                Images in different clusters look quite different from each other
              </motion.p>
            )}
            {showImageSimilarity && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="ec-caption-text"
              >
                Images in the same cluster are very similar to each other
              </motion.p>
            )}
          </div>
        </div>

        <div className="ec-col-overlay">
          {showImageDifference && <ImageDifferenceOverlay />}
          {showImageSimilarity && <ImageSimilarityOverlay />}
        </div>
      </div>
    </div>
  );
}
