import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {initFirebase} from './firebase';
import App from './App.tsx';
import './index.css';

initFirebase().catch(() => {
  // Firebase optional: app works without it (e.g. missing env in dev)
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
