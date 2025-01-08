'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Confetti from 'react-confetti';
import { Comfortaa } from 'next/font/google';

const comfortaa = Comfortaa({ subsets: ['latin'] });

// Create a context for the celebration
const CelebrationContext = createContext({
  triggerCelebration: (message) => {},
  celebrateSurveyCompletion: (isAllComplete) => {}
});

// Export the hook to trigger celebration
export const useCelebration = () => useContext(CelebrationContext);

// Add message arrays for celebrations
const PROGRESS_MESSAGES = [
  "Great progress! Keep going! 🌟",
  "You're doing fantastic! 🎯",
  "Excellent work! Keep it up! 💪",
  "Amazing progress! You're crushing it! 🚀",
  "Wonderful job! Keep the momentum going! ⭐",
  "You're on fire! Keep going! 🔥",
  "Fantastic effort! You're making great strides! 🌈",
  "Outstanding work! Keep pushing forward! 💫",
  "You're doing incredible! Keep the pace! 🎨",
  "Brilliant progress! You're almost there! 🌺"
];

const COMPLETION_MESSAGES = [
  "Congratulations! You've completed all surveys! 🎉",
  "Amazing achievement! You've finished everything! 🏆",
  "Incredible job! You've conquered all surveys! 🌟",
  "Outstanding work! You've mastered all categories! 🎯",
  "Phenomenal effort! You've completed the full journey! 🚀",
  "You're a star! All surveys completed! ⭐",
  "Magnificent work! You've reached the summit! 🏔️",
  "Brilliant achievement! You've done it all! 💫",
  "Exceptional work! You've completed everything! 🎨",
  "Spectacular finish! You've mastered it all! 🌈"
];

export function CelebrationProvider({ children }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      // Show message immediately
      setIsVisible(true);

      // Start fading out after 6 seconds
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);

      // Remove confetti and clean up after fade animation (0.5s)
      const cleanupTimer = setTimeout(() => {
        setShowConfetti(false);
        setCelebrationMessage('');
      }, 6500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [showConfetti]);

  const getRandomMessage = (messages) => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  const triggerCelebration = (message) => {
    setCelebrationMessage(message);
    setShowConfetti(true);
  };

  const celebrateSurveyCompletion = (isAllComplete) => {
    const message = isAllComplete 
      ? getRandomMessage(COMPLETION_MESSAGES)
      : getRandomMessage(PROGRESS_MESSAGES);
    setCelebrationMessage(message);
    setShowConfetti(true);
  };

  return (
    <CelebrationContext.Provider value={{ triggerCelebration, celebrateSurveyCompletion }}>
      {children}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
          <div 
            className="fixed inset-0 bg-black/30 transition-opacity duration-500"
            style={{ opacity: isVisible ? 1 : 0 }}
          />
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            numberOfPieces={200}
            recycle={false}
            colors={[
              '#006666', // Theme color
              '#993366', // Secondary color
              '#FFD700', // Gold
              '#FF69B4', // Pink
              '#4CAF50', // Green
              '#2196F3', // Blue
            ]}
            gravity={0.3}
            tweenDuration={4000}
            confettiSource={{
              x: windowDimensions.width / 2,
              y: windowDimensions.height / 2,
              w: 0,
              h: 0
            }}
            initialVelocityX={15}
            initialVelocityY={30}
            onConfettiComplete={(confetti) => {
              confetti?.reset();
            }}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: `translate(-50%, ${isVisible ? '-50%' : '-45%'})`,
              scale: isVisible ? '1' : '0.95'
            }}
          >
            <div className="bg-white/95 p-8 rounded-xl shadow-2xl text-center max-w-md border-2 border-[#006666]/20">
              <h3 className={`text-2xl sm:text-3xl font-bold text-[#006666] mb-4 ${comfortaa.className}`}>
                {celebrationMessage}
              </h3>
              {celebrationMessage.toLowerCase().includes('all') && (
                <p className="text-[#993366] mt-2 text-lg">
                  Your dedication to understanding your health is remarkable! 🌟
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </CelebrationContext.Provider>
  );
}
