import { ToastProvider } from './context/ToastContext';
import Blog from './components/Blog/Blog';
import OnlineFooter from './components/OnlineFooter/OnlineFooter';
import './App.module.css';

export default function App() {
  return (
    <ToastProvider>
      <Blog />
      <OnlineFooter />
    </ToastProvider>
  );
}
