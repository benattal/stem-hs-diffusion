import { createSlideRenderer } from '@core/components/SlideRenderer.jsx';
import { presentation } from '../data/presentation.js';

// Core layouts
import TitleSlide from '@core/components/layouts/TitleSlide/TitleSlide.jsx';
import OutlineSlide from '@core/components/layouts/OutlineSlide/OutlineSlide.jsx';
import ContentSlide from '@core/components/layouts/ContentSlide/ContentSlide.jsx';
import ProgressiveBuildSlide from '@core/components/layouts/ProgressiveBuildSlide/ProgressiveBuildSlide.jsx';
import DiagramSlide from '@core/components/layouts/DiagramSlide/DiagramSlide.jsx';
import MediaSlide from '@core/components/layouts/MediaSlide/MediaSlide.jsx';
import PollSlide from '@core/components/layouts/PollSlide/PollSlide.jsx';
import PollResultsSlide from '@core/components/layouts/PollResultsSlide/PollResultsSlide.jsx';
import IllustratedPointsSlide from '@core/components/layouts/IllustratedPointsSlide/IllustratedPointsSlide.jsx';
import ColabLinkSlide from '@core/components/layouts/ColabLinkSlide/ColabLinkSlide.jsx';

// Image-manipulation-specific layouts
import VideoAutoplaySlide from './layouts/VideoAutoplaySlide/VideoAutoplaySlide.jsx';
import PixelZoomSlide from './layouts/PixelZoomSlide/PixelZoomSlide.jsx';
import VideoCompareSlide from './layouts/VideoCompareSlide/VideoCompareSlide.jsx';
import GeometricTransformSlide from './layouts/GeometricTransformSlide/GeometricTransformSlide.jsx';
import RetouchingSliderSlide from './layouts/RetouchingSliderSlide/RetouchingSliderSlide.jsx';
import PanoramaBuilderSlide from './layouts/PanoramaBuilderSlide/PanoramaBuilderSlide.jsx';
import TwoColumnSlide from './layouts/TwoColumnSlide/TwoColumnSlide.jsx';

const layoutMap = {
  title: TitleSlide,
  outline: OutlineSlide,
  content: ContentSlide,
  progressiveBuild: ProgressiveBuildSlide,
  diagram: DiagramSlide,
  media: MediaSlide,
  poll: PollSlide,
  pollResults: PollResultsSlide,
  illustratedPoints: IllustratedPointsSlide,
  colabLink: ColabLinkSlide,
  videoAutoplay: VideoAutoplaySlide,
  pixelZoom: PixelZoomSlide,
  videoCompare: VideoCompareSlide,
  geometricTransform: GeometricTransformSlide,
  retouchingSlider: RetouchingSliderSlide,
  panoramaBuilder: PanoramaBuilderSlide,
  twoColumn: TwoColumnSlide,
};

export default createSlideRenderer(layoutMap, () => presentation);
