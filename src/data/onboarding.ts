import type {ImageSourcePropType} from 'react-native';

import {onboardingHeroes} from './assets';

export type OnboardingStep = {
  hero: ImageSourcePropType;
  title: string;
  description: string;
  buttonLabel: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    hero: onboardingHeroes.step1,
    title: 'Explore the game pack',
    description:
      'Discover a wide range of game titles, browse categories, search by name, and find what interests you most',
    buttonLabel: 'Continue',
  },
  {
    hero: onboardingHeroes.step2,
    title: 'Reviews meet analytics',
    description:
      'Compare ratings, explore reviews, track trends, and understand how different games perform across key metrics',
    buttonLabel: 'Continue',
  },
  {
    hero: onboardingHeroes.step3,
    title: 'Build your own collection',
    description:
      'Save titles, rate them 1–5 stars after you try them, and watch your personal taste take shape across categories and providers.',
    buttonLabel: 'Get Started',
  },
];
