import Presentation from './components/Presentation.jsx'
import PresenterView from './components/PresenterView.jsx'
import PreviewMode from './components/PreviewMode.jsx'

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'presenter') {
    return <PresenterView />;
  }
  if (params.get('mode') === 'preview') {
    return <PreviewMode />;
  }
  return <Presentation />;
}
