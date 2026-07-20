import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BASE_URL } from '../../services';
import { Close, ChevronLeft, ChevronRight } from '../icons/icons';
import useScrollLock from '../../hooks/useScrollLock';
import styles from './Lightbox.module.css';

interface LightboxProps {
  files: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ files, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [textContent, setTextContent] = useState<string | null>(null);

  const filePath = files[index] ?? null;
  const isImage = /\.(jpg|jpeg|gif|png)$/i.test(filePath ?? '');
  const fullUrl = filePath ? BASE_URL + filePath : '';
  const isLoading = !isImage && filePath !== null && textContent === null;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + files.length) % files.length);
  }, [files.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % files.length);
  }, [files.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    },
    [onClose, goPrev, goNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useScrollLock(true);

  useEffect(() => {
    if (!filePath || isImage) return;

    let cancelled = false;

    fetch(fullUrl)
      .then((res) => res.text())
      .then((content) => {
        if (!cancelled) setTextContent(content);
      })
      .catch(() => {
        if (!cancelled) setTextContent('Failed to load file content');
      });

    return () => { cancelled = true; };
  }, [filePath, isImage, fullUrl]);

  if (files.length === 0) return null;

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

        {files.length > 1 && (
          <div className={styles.counter}>
            {index + 1} / {files.length}
          </div>
        )}

        <div className={styles.viewer}>
          {files.length > 1 && (
            <button
              className={styles.navBtn}
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className={styles.mediaWrap}>
            {isImage ? (
              <img key={index} src={fullUrl} alt="preview" className={styles.image} />
            ) : isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <pre className={styles.textContent}>{textContent}</pre>
            )}
          </div>

          {files.length > 1 && (
            <button
              className={styles.navBtn}
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        <a href={fullUrl} download className={styles.downloadBtn}>
          Download
        </a>
      </div>
    </div>,
    document.body,
  );
}
