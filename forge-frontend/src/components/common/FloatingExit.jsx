// Floating exit animation component
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useRef, useLayoutEffect, useState } from 'react';

const FloatingExit = ({ visible, children }) => {
  const ref = useRef(null);
  const [floatingStyle, setFloatingStyle] = useState(null);

  useLayoutEffect(() => {
    if (!visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setFloatingStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: 9999,
      });
    }
  }, [visible]);

  return (
    <>
      <AnimatePresence>
        {visible ? (
          <Motion.div
            key="content"
            ref={ref}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{}}
          >
            {children}
          </Motion.div>
        ) : (
          floatingStyle && (
            <Motion.div
                key="floating"
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{
                    x: [0,-20,-40,-60],
                    y: [0, -30, -80, 600], 
                    scale: [1, 1.05, 0.98, 1],
                    rotate: [0, -2, -4, -6],
                }}
                transition={{
                    duration: 0.8,
                    times: [0, 0.4, 0.65, 1],        
                    ease: 'easeInOut',
                }}
                style={floatingStyle}
                onAnimationComplete={() => setFloatingStyle(null)}
                >
                {children}
            </Motion.div>



          )
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingExit;
