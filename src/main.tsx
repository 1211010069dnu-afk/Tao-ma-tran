   import { installApiShim } from './services/localApi';
   installApiShim();   // đặt TRƯỚC dòng createRoot(...).render(...)
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
