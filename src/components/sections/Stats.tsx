'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function Counter({ end, suffix = '', prefix = '', duration = 2 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const linearProgress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = easeOutCubic(linearProgress);

      setCount(Math.floor(easedProgress * end));

      if (linearProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { value: 21, suffix: '+', label: 'Hours Saved Per Transaction' },
  { value: 50, prefix: '$', suffix: '', label: 'Average Cost Per Deal' },
  { value: 99, suffix: '.9%', label: 'Uptime' },
];

export default function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#00BEFF]/10 via-[#8b5cf6]/10 to-[#00BEFF]/10 parallax-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <AnimatedSection key={index} delay={index * 0.2}>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#00BEFF] mb-2">
                  <Counter
                    end={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </div>
                <p className="text-gray-400 text-lg">{stat.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
