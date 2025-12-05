import { useEffect, useState } from 'react';

/**
 * Custom hook for animating numbers counting up from 0 to target value
 * @param end - The target number to count to
 * @param duration - Duration of the animation in milliseconds (default: 800ms)
 * @param start - Starting number (default: 0)
 * @returns The current animated value
 */
export function useCountUp(end: number, duration: number = 800, start: number = 0): number {
  const [count, setCount] = useState(start);

  useEffect(() => {
    // Don't animate if end value is 0 or same as start
    if (end === start) {
      setCount(end);
      return;
    }

    const startTime = Date.now();
    const difference = end - start;

    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < duration) {
        // Easing function for smooth animation (ease-out)
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = start + (difference * easeOut);
        
        setCount(Math.floor(currentCount));
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    const animationFrame = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, start]);

  return count;
}
