/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';

function Hero() {
  return (
    <div className="hero my-5 text-center" data-testid="hero">
      <img src="/images/stablethread.svg" alt="Logo" />
      <h1 className="lead" data-testid="hero-lead" style={{ fontSize: '24px' }}>
        Solana PayFac
      </h1>
    </div>
  );
}

export default Hero;
