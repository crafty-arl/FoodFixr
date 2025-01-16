import { StaticImageData } from 'next/image';

export interface SurveyCategory {
  name: string;
  progress: number;
  icon: string | StaticImageData;
  questionCount: number;
  answeredCount: number;
  hasNotification: boolean;
}

export const INITIAL_CATEGORIES: SurveyCategory[] = [
  {
    name: 'Toxins',
    progress: 0,
    icon: '/toxins.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Sugar',
    progress: 0,
    icon: '/sugar.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Alkalinity',
    progress: 0,
    icon: '/alkalinity.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Food Combining',
    progress: 0,
    icon: '/foodcombining.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Timing',
    progress: 0,
    icon: '/mealtiming.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Pre_probiotics',
    progress: 0,
    icon: '/pre_probiotics.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Macros',
    progress: 0,
    icon: '/macronutrient_balance.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Gut_BrainHealth',
    progress: 0,
    icon: '/gut_brainsupport.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  }
]; 