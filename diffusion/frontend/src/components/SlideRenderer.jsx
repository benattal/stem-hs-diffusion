import { createSlideRenderer } from '@core/components/SlideRenderer.jsx';
import { presentation } from '../data/presentation.js';

// Shared layouts from core
import TitleSlide from './layouts/TitleSlide.jsx';
import OutlineSlide from '@core/components/layouts/OutlineSlide/OutlineSlide.jsx';
import ContentSlide from '@core/components/layouts/ContentSlide/ContentSlide.jsx';
import ProgressiveBuildSlide from '@core/components/layouts/ProgressiveBuildSlide/ProgressiveBuildSlide.jsx';
import DiscussionSlide from '@core/components/layouts/DiscussionSlide/DiscussionSlide.jsx';
import DiagramSlide from '@core/components/layouts/DiagramSlide/DiagramSlide.jsx';
import MediaSlide from '@core/components/layouts/MediaSlide/MediaSlide.jsx';
import ColabLinkSlide from '@core/components/layouts/ColabLinkSlide/ColabLinkSlide.jsx';
import PollSlide from '@core/components/layouts/PollSlide/PollSlide.jsx';
import PollResultsSlide from '@core/components/layouts/PollResultsSlide/PollResultsSlide.jsx';
import GenAiDemoSlide from '@core/components/layouts/GenAiDemoSlide/GenAiDemoSlide.jsx';
import IllustratedPointsSlide from '@core/components/layouts/IllustratedPointsSlide/IllustratedPointsSlide.jsx';
import GenAiOverviewSlide from '@core/components/layouts/GenAiOverviewSlide/GenAiOverviewSlide.jsx';

// Diffusion-only layouts
import DiffusionSliderSlide from './layouts/DiffusionSliderSlide/DiffusionSliderSlide.jsx';
import EmbeddingSpaceSlide from './layouts/EmbeddingSpaceSlide/EmbeddingSpaceSlide.jsx';
import GenerationOverviewSlide from './layouts/GenerationOverviewSlide/GenerationOverviewSlide.jsx';
import DiffusionModelSlide from './layouts/DiffusionModelSlide/DiffusionModelSlide.jsx';
import EmbeddingClustersSlide from './layouts/EmbeddingClustersSlide/EmbeddingClustersSlide.jsx';
import NoiseDefinitionSlide from './layouts/NoiseDefinitionSlide/NoiseDefinitionSlide.jsx';
import DiffusionRandomnessSlide from './layouts/DiffusionRandomnessSlide/DiffusionRandomnessSlide.jsx';

const layoutMap = {
  title: TitleSlide,
  outline: OutlineSlide,
  content: ContentSlide,
  progressiveBuild: ProgressiveBuildSlide,
  discussion: DiscussionSlide,
  diagram: DiagramSlide,
  media: MediaSlide,
  colabLink: ColabLinkSlide,
  diffusionSlider: DiffusionSliderSlide,
  poll: PollSlide,
  pollResults: PollResultsSlide,
  embeddingSpace: EmbeddingSpaceSlide,
  genAiDemo: GenAiDemoSlide,
  illustratedPoints: IllustratedPointsSlide,
  generationOverview: GenerationOverviewSlide,
  diffusionModel: DiffusionModelSlide,
  embeddingClusters: EmbeddingClustersSlide,
  genAiOverview: GenAiOverviewSlide,
  noiseDefinition: NoiseDefinitionSlide,
  diffusionRandomness: DiffusionRandomnessSlide,
};

export default createSlideRenderer(layoutMap, () => presentation);
