import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;

    if (!dot || !outline) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(outline, { xPercent: -50, yPercent: -50 });

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(dot, { duration: 0.1, x: e.clientX, y: e.clientY });
      gsap.to(outline, { duration: 0.5, x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => {
      gsap.to(outline, { scale: 0.5, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to(outline, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot fixed pointer-events-none z-[9999]" />
      <div ref={outlineRef} className="cursor-outline fixed pointer-events-none z-[9999]" />
    </>
  );
};

export default CustomCursor;