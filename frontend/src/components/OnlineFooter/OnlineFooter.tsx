import styles from './OnlineFooter.module.css';
import useOnlineCount from '../../hooks/useOnlineCount';

export default function OnlineFooter() {
  const count = useOnlineCount();

  return (
    <footer className={styles.footer}>
      Online: {count}
    </footer>
  );
}
