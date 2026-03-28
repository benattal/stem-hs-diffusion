import Presentation from './components/Presentation.jsx'
import PresenterView from '@core/components/PresenterView.jsx'
import PreviewMode from '@core/components/PreviewMode.jsx'
import { PresenterModeProvider } from '@core/hooks/usePresenterMode.jsx'

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
    return (
      <PresenterModeProvider>
        <PreviewMode />
      </PresenterModeProvider>
    );
  }
  return (
    <PresenterModeProvider>
      <Presentation />
    </PresenterModeProvider>
  );
}
