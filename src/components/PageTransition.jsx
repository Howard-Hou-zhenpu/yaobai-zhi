import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-enter');
    void el.offsetWidth;
    el.classList.add('page-enter');
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}
