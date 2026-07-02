import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export default function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={className ? `${styles.btn} ${className}` : styles.btn}
      {...props}
    />
  );
}
