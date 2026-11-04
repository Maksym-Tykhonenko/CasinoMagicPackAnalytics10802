import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (alive) {
        setReduce(value);
      }
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduce,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduce;
}
