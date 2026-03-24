import Presentation from './components/Presentation.jsx'
import PresenterView from './components/PresenterView.jsx'
import PreviewMode from './components/PreviewMode.jsx'
import { PresenterModeProvider } from './hooks/usePresenterMode.jsx'

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'presenter') {
    return (
      <PresenterModeProvider>
        <PresenterView />
      </PresenterModeProvider>
    );
  }
  if (params.get('mode') === 'preview') {
    return <PreviewMode />;
  }
  return (
    <PresenterModeProvider>
      <Presentation />
    </PresenterModeProvider>
  );
}
