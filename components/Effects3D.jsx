import { useEffect, useRef, useCallback } from 'react';

/**
 * 3D Tilt Card wrapper — adds mouse-tracking perspective tilt
 * Usage: <TiltCard intensity={12}><div>your content</div></TiltCard>
 */
export function TiltCard({ children, intensity = 10, scale = 1.02, className = '', style = {}, glare = false }) {
  const ref = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (0.5 - y) * intensity;
    const tiltY = (x - 0.5) * intensity;
    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale},${scale},${scale})`;

    if (glare) {
      const glareEl = el.querySelector('.tilt-glare');
      if (glareEl) {
        glareEl.style.opacity = '1';
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
      }
    }
  }, [intensity, scale, glare]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glare) {
      const glareEl = el.querySelector('.tilt-glare');
      if (glareEl) glareEl.style.opacity = '0';
    }
  }, [glare]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
      {glare && (
        <div className="tilt-glare" style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none', opacity: 0, transition: 'opacity 0.3s',
          zIndex: 10,
        }} />
      )}
    </div>
  );
}

/**
 * Scroll-triggered fade-in with 3D transforms
 * Usage: <ScrollReveal type="up" delay={0.1}><div>content</div></ScrollReveal>
 */
export function ScrollReveal({ children, type = 'up', delay = 0, duration = 0.7, threshold = 0.05, style = {}, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    const transforms = {
      up: 'translateY(30px) rotateX(4deg)',
      down: 'translateY(-30px) rotateX(-4deg)',
      left: 'translateX(40px) rotateY(-4deg)',
      right: 'translateX(-40px) rotateY(4deg)',
      scale: 'scale3d(0.9, 0.9, 0.9)',
      flip: 'rotateY(15deg) translateZ(-30px)',
    };

    el.style.opacity = '0';
    el.style.transform = transforms[type] || transforms.up;
    el.style.transition = `opacity ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s, transform ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`;

    // If element is already in or above viewport on mount, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) translateX(0) rotateX(0) rotateY(0) scale3d(1,1,1) translateZ(0)';
      });
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) translateX(0) rotateX(0) rotateY(0) scale3d(1,1,1) translateZ(0)';
        observer.unobserve(el);
      }
    }, { threshold, rootMargin: '0px 0px -30px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [type, delay, duration, threshold]);

  return (
    <div ref={ref} className={className} style={{ perspective: '1000px', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
}

/**
 * Floating 3D animation — subtle continuous float
 * Usage: <Float3D speed={4} distance={8}><img src="..." /></Float3D>
 */
export function Float3D({ children, speed = 4, distance = 8, rotate = 3, delay = 0, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animation = `float3d ${speed}s ease-in-out ${delay}s infinite`;
  }, [speed, delay]);

  return (
    <div ref={ref} style={{ willChange: 'transform', ...style }}>
      <style>{`
        @keyframes float3d {
          0%, 100% { transform: translateY(0) rotateX(0) rotateZ(0); }
          25% { transform: translateY(-${distance}px) rotateX(${rotate}deg) rotateZ(${rotate * 0.5}deg); }
          50% { transform: translateY(-${distance * 0.5}px) rotateX(-${rotate * 0.5}deg) rotateZ(-${rotate * 0.3}deg); }
          75% { transform: translateY(-${distance * 1.2}px) rotateX(${rotate * 0.7}deg) rotateZ(${rotate * 0.4}deg); }
        }
      `}</style>
      {children}
    </div>
  );
}

/**
 * Parallax depth layer — moves at different speed on scroll
 * Usage: <ParallaxLayer speed={0.3}><div>background</div></ParallaxLayer>
 */
export function ParallaxLayer({ children, speed = 0.2, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (center - viewCenter) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} style={{ willChange: 'transform', transition: 'transform 0.1s linear', ...style }}>
      {children}
    </div>
  );
}

/**
 * 3D Card with depth layers — creates layered depth illusion
 */
export function DepthCard({ children, className = '', style = {} }) {
  const ref = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Move child layers at different depths
    const layers = el.querySelectorAll('[data-depth]');
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 1;
      layer.style.transform = `translate3d(${x * 10 * depth}px, ${y * 10 * depth}px, ${depth * 20}px)`;
    });

    el.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    const layers = el.querySelectorAll('[data-depth]');
    layers.forEach(layer => {
      layer.style.transform = 'translate3d(0, 0, 0)';
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
