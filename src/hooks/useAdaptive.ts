import {useMemo} from 'react';
import {Dimensions, useWindowDimensions} from 'react-native';

import {DESIGN_HEIGHT, DESIGN_WIDTH} from '../constants/theme';

const fallbackWindow = Dimensions.get('window');

export function useAdaptive() {
  const windowSize = useWindowDimensions();
  const width = windowSize.width || fallbackWindow.width || DESIGN_WIDTH;
  const height = windowSize.height || fallbackWindow.height || DESIGN_HEIGHT;

  return useMemo(() => {
    const isNarrow = width < 370;
    const isSmallHeight = height < 740;
    const isTinyHeight = height < 660;
    const portraitWidth = Math.min(width, height);

    const scale = (size: number) => (width / DESIGN_WIDTH) * size;
    const verticalScale = (size: number) => (height / DESIGN_HEIGHT) * size;
    const tabScale = (size: number) => (portraitWidth / DESIGN_WIDTH) * size;

    return {
      width,
      height,
      isNarrow,
      isSmallHeight,
      isTinyHeight,
      scale,
      verticalScale,
      tabScale,
      horizontalPadding: isNarrow ? scale(16) : scale(26),
    };
  }, [width, height]);
}
