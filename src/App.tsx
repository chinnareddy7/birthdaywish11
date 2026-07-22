import { useEffect, useState } from 'react';
import Home from './pages/Home';
import GenerateSurprise from './pages/GenerateSurprise';
import SurpriseView from './pages/SurpriseView';

type View = 'home' | 'generate';

function parseRoute(): { view: 'surprise'; slug: string } | { view: 'home' | 'generate' } {
  const path = window.location.pathname;
  const m = path.match(/^\/s\/([a-z0-9-]+)$/i);
  if (m) return { view: 'surprise', slug: m[1] };
  return { view: 'home' };
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute());
  const [view, setView] = useState<View>('home');

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route.view === 'surprise') {
    return <SurpriseView slug={route.slug} />;
  }

  if (view === 'generate') {
    return <GenerateSurprise onBack={() => setView('home')} />;
  }

  return <Home onGenerate={() => setView('generate')} />;
}
