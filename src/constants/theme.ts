import {Platform} from 'react-native';

import {fonts} from './fonts';

export const DESIGN_WIDTH = 393;
export const DESIGN_HEIGHT = 852;

export const colors = {
  background: '#05070e',
  surface: '#05070e',
  ivory: '#e9f0fa',
  body: 'rgba(234, 240, 250, 0.6)',
  bodyMuted: 'rgba(234, 240, 250, 0.55)',

  bodySoft: 'rgba(234, 240, 250, 0.5)',
  bodyFaint: 'rgba(234, 240, 250, 0.45)',
  bodyDim: 'rgba(234, 240, 250, 0.35)',
  bodyHint: 'rgba(234, 240, 250, 0.32)',
  skip: 'rgba(234, 240, 250, 0.5)',
  label: 'rgba(234, 240, 250, 0.45)',
  disabledText: 'rgba(234, 240, 250, 0.3)',
  accent: '#4a9bff',
  accentSoft: '#6ba8ff',
  accentBright: '#7fb2ff',
  accentGlow: 'rgba(46, 123, 255, 0.35)',
  accentShadow: 'rgba(46, 123, 255, 0.4)',
  accentBorder: 'rgba(74, 155, 255, 0.5)',
  accentFillMuted: 'rgba(74, 155, 255, 0.12)',
  checkFill: '#6ba8ff',
  checkBorder: 'rgba(107, 168, 255, 0.28)',
  buttonText: '#04070f',
  /** Solid panel under cover fades — keeps art→copy blend seamless. */
  cardPanel: '#141824',
  card: 'rgba(255, 255, 255, 0.08)',

  cardStrong: 'rgba(255, 255, 255, 0.1)',
  cardMuted: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.15)',
  cardBorderMuted: 'rgba(255, 255, 255, 0.12)',
  cardBorderStrong: 'rgba(255, 255, 255, 0.16)',
  cardBorderIdle: 'rgba(255, 255, 255, 0.2)',
  inputFill: 'rgba(255, 255, 255, 0.08)',
  progressTrack: 'rgba(255, 255, 255, 0.14)',
  dotInactive: 'rgba(255, 255, 255, 0.22)',
  checkboxIdle: 'rgba(255, 255, 255, 0.28)',
  buttonDisabled: 'rgba(255, 255, 255, 0.09)',
  segment: 'rgba(255, 255, 255, 0.09)',
  hairline: 'rgba(255, 255, 255, 0.14)',
  iconRing: 'rgba(255, 255, 255, 0.22)',
  gain: '#6be39a',
  star: '#ffc761',
  interest: '#9cc6ff',
  tabBar: 'rgba(8, 12, 22, 0.96)',
  tabInactive: 'rgba(233, 240, 255, 0.68)',
  featuredBadge: 'rgba(74, 155, 255, 0.9)',
  searchFill: 'rgba(255, 255, 255, 0.09)',
  rankFill: 'rgba(4, 7, 15, 0.65)',
  veil: 'rgba(4, 7, 15, 0.6)',
  black: '#000000',
  white: '#ffffff',
};

export const spacing = {
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 26,
};

export const radius = {
  card: 18,
  button: 16,
  input: 15,
  checkbox: 8,
  chip: 12,
  icon: 17,
  pill: 9,
};

export const fontSize = {
  overline: 10,
  caption: 11,
  small: 11.5,
  body: 14,
  copy: 15,
  button: 16.5,
  title: 26,
  hero: 28,
  display: 30,
};

export const layout = {
  screenPadding: 26,
  buttonHeight: 54,
  inputHeight: 54,
  iconSize: 66,
};

export const topInset = (value: number) =>
  Platform.OS === 'android' ? Math.max(value, 30) : value;

export {fonts};
