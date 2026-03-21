import Presentation from './components/Presentation.jsx'
import PresenterView from './components/PresenterView.jsx'

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'presenter') {
    return <PresenterView />;
  }
  return <Presentation />;
}
