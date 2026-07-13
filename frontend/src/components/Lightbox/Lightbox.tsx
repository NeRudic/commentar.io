import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BASE_URL } from '../../services';
import { Close } from '../icons/icons';
import styles from './Lightbox.module.css';

interface LightboxProps {
  filePath: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Lightbox({ filePath, isOpen, onClose }: LightboxProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isImage = /\.(jpg|jpeg|gif|png)$/i.test(filePath ?? '');
  const fullUrl = filePath ? BASE_URL + filePath : '';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !filePath || isImage) {
      setTextContent(null);
      return;
    }

    setLoading(true);
    fetch(fullUrl)
      .then((res) => res.text())
      .then(setTextContent)
      .catch(() => setTextContent('Failed to load file content'))
      .finally(() => setLoading(false));
  }, [isOpen, filePath, isImage, fullUrl]);

  if (!isOpen || !filePath) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <Close size={24} />
        </button>

        {isImage ? (
          <img src={fullUrl} alt="preview" className={styles.image} />
        ) : loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <pre className={styles.textContent}>{textContent}</pre>
        )}

        <a href={fullUrl} download className={styles.downloadBtn}>
          Download
        </a>
      </div>
    </div>,
    document.body,
  );
}
