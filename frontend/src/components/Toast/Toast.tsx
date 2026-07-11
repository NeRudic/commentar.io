import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onRemove: () => void;
}

export default function Toast({ message, onRemove }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(onRemove, 500);
    return () => clearTimeout(timer);
  }, [exiting, onRemove]);

  return (
    <div className={`${styles.toast} ${exiting ? styles.exit : ''}`}>
      {message}
    </div>
  );
}
