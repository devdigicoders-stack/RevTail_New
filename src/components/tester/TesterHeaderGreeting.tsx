'use client';

import React, { useEffect, useState } from 'react';

interface TesterHeaderGreetingProps {
  fullName: string;
}

export default function TesterHeaderGreeting({ fullName }: TesterHeaderGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');
  const [icon, setIcon] = useState('👋');
  const [subtitle, setSubtitle] = useState('Welcome to your testing dashboard');

  const firstName = fullName?.trim() ? fullName.trim().split(' ')[0] : 'Tester';

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setIcon('☀️');
      setSubtitle('Start your day with new testing campaigns!');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setIcon('🌤️');
      setSubtitle('Explore active products & share your feedback!');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good Evening');
      setIcon('🌆');
      setSubtitle('Check your campaign progress & wallet rewards!');
    } else {
      setGreeting('Good Night');
      setIcon('🌙');
      setSubtitle('Late night testing? Great to have you here!');
    }
  }, []);

  return (
    <div className="tester-header-greeting d-flex align-items-center ms-2">
      <div className="d-flex flex-column">
        <div className="d-flex align-items-center gap-1">
          <span
            className="fw-bold text-dark greeting-title"
            style={{
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {greeting},{' '}
            <span style={{ color: '#002E7E' }}>{firstName}</span>{' '}
            <span
              style={{
                fontSize: '1.15rem',
                display: 'inline-block',
                transform: 'translateY(-1px)',
              }}
            >
              {icon}
            </span>
          </span>
        </div>
        <span
          className="text-muted greeting-subtitle d-none d-sm-inline"
          style={{
            fontSize: '11.5px',
            marginTop: '2px',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}
