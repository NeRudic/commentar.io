import { ToastProvider } from './context/ToastContext';
import Blog from './components/Blog/Blog';
import './App.module.css';

export default function App() {
  return (
    <ToastProvider>
      <Blog />
    </ToastProvider>
  );
}
