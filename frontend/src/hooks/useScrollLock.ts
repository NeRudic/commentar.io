import { useEffect, useRef } from 'react';

let lockCount = 0;

export default function useScrollLock(active: boolean) {
  const engaged = useRef(false);

  useEffect(() => {
    if (!active) return;

    engaged.current = true;
    lockCount++;

    if (lockCount === 1) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      if (!engaged.current) return;
      engaged.current = false;
      lockCount--;

      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [active]);
}
