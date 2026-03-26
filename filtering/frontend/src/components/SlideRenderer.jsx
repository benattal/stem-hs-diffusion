import { createSlideRenderer } from '@core/components/SlideRenderer.jsx';
import { presentation } from '../data/presentation.js';

// All layouts from core
import TitleSlide from '@core/components/layouts/TitleSlide/TitleSlide.jsx';
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

// Filtering-specific layouts
import ImagePollSlide from './layouts/ImagePollSlide/ImagePollSlide.jsx';
import TemporalBlurDemoSlide from './layouts/TemporalBlurDemoSlide/TemporalBlurDemoSlide.jsx';
import SpatialBlurDemoSlide from './layouts/SpatialBlurDemoSlide/SpatialBlurDemoSlide.jsx';
import ConvolutionAnimationSlide from './layouts/ConvolutionAnimationSlide/ConvolutionAnimationSlide.jsx';
import FilterDesignerSlide from './layouts/FilterDesignerSlide/FilterDesignerSlide.jsx';
import KernelPollSlide from './layouts/KernelPollSlide/KernelPollSlide.jsx';
import KernelPollResultsSlide from './layouts/KernelPollResultsSlide/KernelPollResultsSlide.jsx';
import MultiFilterCompareSlide from './layouts/MultiFilterCompareSlide/MultiFilterCompareSlide.jsx';
import FilterStackSlide from './layouts/FilterStackSlide/FilterStackSlide.jsx';
import ImagePipelineSlide from './layouts/ImagePipelineSlide/ImagePipelineSlide.jsx';

const layoutMap = {
  title: TitleSlide,
  outline: OutlineSlide,
  content: ContentSlide,
  progressiveBuild: ProgressiveBuildSlide,
  discussion: DiscussionSlide,
  diagram: DiagramSlide,
  media: MediaSlide,
  colabLink: ColabLinkSlide,
  poll: PollSlide,
  pollResults: PollResultsSlide,
  genAiDemo: GenAiDemoSlide,
  illustratedPoints: IllustratedPointsSlide,
  genAiOverview: GenAiOverviewSlide,
  imagePoll: ImagePollSlide,
  temporalBlurDemo: TemporalBlurDemoSlide,
  spatialBlurDemo: SpatialBlurDemoSlide,
  convolutionAnimation: ConvolutionAnimationSlide,
  filterDesigner: FilterDesignerSlide,
  kernelPoll: KernelPollSlide,
  kernelPollResults: KernelPollResultsSlide,
  multiFilterCompare: MultiFilterCompareSlide,
  filterStack: FilterStackSlide,
  imagePipeline: ImagePipelineSlide,
};

export default createSlideRenderer(layoutMap, () => presentation);
