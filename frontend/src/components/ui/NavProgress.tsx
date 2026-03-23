import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavProgress — a thin purple glow bar that runs across the top of the
 * viewport on every route change, then fades out once the new page has
 * mounted.  Pure CSS-driven; no external libraries needed.
 */
const NavProgress: React.FC = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Clear any existing timer so rapid navigations don't stack.
    if (timerRef.current) clearTimeout(timerRef.current);

    // Start the bar
    setDone(false);
    setActive(true);

    // Keep the progress bar short and subtle so it supports navigation
    // feedback without making the route change feel slower than it is.
    timerRef.current = setTimeout(() => {
      setDone(true);
      // Remove from DOM shortly after the fade-out begins.
      timerRef.current = setTimeout(() => {
        setActive(false);
        setDone(false);
      }, 180);
    }, 220);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  if (!active) return null;

  return (
    <div className={`ff-nav-progress${done ? ' ff-nav-progress--done' : ''}`}>
      <div className="ff-nav-progress__bar" />
    </div>
  );
};

export default NavProgress;
