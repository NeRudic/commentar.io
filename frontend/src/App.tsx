import { ToastProvider } from './context/ToastContext';
import Blog from './components/Blog/Blog';
import OnlineCount from './components/OnlineCount/OnlineCount';
import './App.module.css';

export default function App() {
  return (
    <ToastProvider>
      <Blog />
      <OnlineCount />
    </ToastProvider>
  );
}
