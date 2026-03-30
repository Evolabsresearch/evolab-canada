const VIALS = [
  { src: '/images/products/catalog/BPC-157 10MG.png',    width: 70,  top: '10%', left: '8%',   duration: '9s',  delay: '0s',   opacity: 0.18 },
  { src: '/images/products/catalog/HGH 191aa 24iu.png',  width: 90,  top: '60%', left: '2%',   duration: '13s', delay: '-3s',  opacity: 0.25 },
  { src: '/images/products/catalog/GLP-3(R) 10MG.png',   width: 60,  top: '15%', right: '5%',  duration: '7s',  delay: '-6s',  opacity: 0.14 },
  { src: '/images/products/catalog/NAD+ 500MG.png',       width: 110, top: '70%', right: '8%',  duration: '11s', delay: '-9s',  opacity: 0.22 },
  { src: '/images/products/catalog/Epithalon 10MG.png',  width: 75,  top: '30%', left: '15%',  duration: '8s',  delay: '-2s',  opacity: 0.12, mobileHide: true },
  { src: '/images/products/catalog/Semax 10MG.png',       width: 85,  top: '80%', left: '30%',  duration: '14s', delay: '-5s',  opacity: 0.28, mobileHide: true },
  { src: '/images/products/catalog/MOTS-C 10MG.png',     width: 65,  top: '5%',  left: '45%',  duration: '10s', delay: '-8s',  opacity: 0.16, mobileHide: true },
  { src: '/images/products/catalog/KPV 10MG.png',         width: 100, top: '55%', right: '20%', duration: '12s', delay: '-11s', opacity: 0.20, mobileHide: true },
];

export default function FloatingVials() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {VIALS.map((v, i) => (
        <img
          key={i}
          src={v.src}
          alt=""
          className={v.mobileHide ? `vial-${i + 1} float-vial-mobile-hide` : `vial-${i + 1}`}
          style={{
            position: 'absolute',
            top: v.top,
            left: v.left,
            right: v.right,
            width: v.width,
            height: 'auto',
            opacity: v.opacity,
            animation: `floatVial ${v.duration} ease-in-out infinite`,
            animationDelay: v.delay,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}
      <style>{`
        @keyframes floatVial {
          0%   { transform: translateY(0px) rotate(-2deg); }
          50%  { transform: translateY(-14px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(-2deg); }
        }
        @media (max-width: 768px) {
          .float-vial-mobile-hide { display: none; }
          .vial-1, .vial-2, .vial-3, .vial-4 { opacity: 0.10 !important; }
        }
      `}</style>
    </div>
  );
}
