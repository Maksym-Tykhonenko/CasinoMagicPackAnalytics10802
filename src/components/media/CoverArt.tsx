import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

import {packArt} from '../../data/assets';
import {useReduceMotion} from '../../hooks/useReduceMotion';

type CoverArtProps = {
  source: ImageSourcePropType;
  fallback?: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
};

function isRemoteSource(source: ImageSourcePropType) {
  if (Array.isArray(source)) {
    return source.some(item => typeof item === 'object' && Boolean(item?.uri));
  }
  return (
    typeof source === 'object' &&
    Boolean(source && 'uri' in source && source.uri)
  );
}

export function CoverArt({
  source,
  fallback = packArt.neonFortune,
  style,
  resizeMode = 'cover',
}: CoverArtProps) {
  const reduce = useReduceMotion();
  const remote = isRemoteSource(source);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(remote);
  const pulse = useRef(new Animated.Value(reduce ? 1 : 0.38)).current;

  useEffect(() => {
    const nextRemote = isRemoteSource(source);
    setFailed(false);
    setPending(nextRemote);
  }, [source]);

  useEffect(() => {
    if (!pending || reduce) {
      pulse.setValue(pending ? 1 : 0.38);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.78,
          duration: 720,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.38,
          duration: 720,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pending, pulse, reduce]);

  return (
    <View pointerEvents="none" style={[style, styles.CoverArtChassis]}>
      <Image
        source={failed ? fallback : source}
        onLoadEnd={() => setPending(false)}
        onError={() => {
          setFailed(true);
          setPending(false);
        }}
        style={styles.CoverArtSigil}
        resizeMode={resizeMode}
      />
      {pending ? (
        <Animated.View style={[styles.CoverArtSkeleton, {opacity: pulse}]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  CoverArtChassis: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  CoverArtSigil: {
        ...StyleSheet.absoluteFill,
  },
  CoverArtSkeleton: {
        ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(155, 184, 224, 0.16)',
  },
});
