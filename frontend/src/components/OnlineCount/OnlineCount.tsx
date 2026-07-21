import styles from './OnlineCount.module.css';
import useOnlineCount from './hooks/useOnlineCount';

export default function OnlineCount() {
  const count = useOnlineCount();

  return (
    <footer className={styles.footer}>
      Online: {count}
    </footer>
  );
}
