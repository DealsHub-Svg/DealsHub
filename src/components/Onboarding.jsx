import React, { useState } from 'react';

const Onboarding = ({ onFinish }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      emoji: "📍",
      title: "Discover Local Halal Deals",
      desc: "Find the best food, gym, salon, and tuition deals near you in one place."
    },
    {
      emoji: "🌟",
      title: "Follow Influencers",
      desc: "Get exclusive referral codes and recommendations from your favorite creators."
    },
    {
      emoji: "🎁",
      title: "Earn Rewards",
      desc: "Complete daily challenges, review deals, and climb the leaderboard to earn points!"
    }
  ];

  const nextSlide = () => {
    if (slide < slides.length - 1) setSlide(slide + 1);
    else onFinish();
  };

  return (
    <div className="onboarding-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
        <div className="animate-float" style={{fontSize: '80px', marginBottom: '30px'}}>
          {slides[slide].emoji}
        </div>
        <h2 className="page-title">{slides[slide].title}</h2>
        <p className="page-subtitle mt-12" style={{maxWidth: '300px', lineHeight: '1.6'}}>
          {slides[slide].desc}
        </p>
      </div>

      <div className="p-24 bg-surface border-t border-border">
        {/* Progress dots */}
        <div className="flex justify-center gap-8 mb-24">
          {slides.map((_, i) => (
            <div 
              key={i} 
              style={{
                width: i === slide ? '24px' : '8px', 
                height: '8px',
                borderRadius: '4px',
                background: i === slide ? 'var(--primary)' : 'var(--bg-input)',
                transition: 'var(--transition)'
              }}
            />
          ))}
        </div>

        <button className="btn btn-primary btn-lg btn-full" onClick={nextSlide}>
          {slide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
