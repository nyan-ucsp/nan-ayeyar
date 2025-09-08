import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaHref,
  backgroundImage,
  className,
}) => {
  return (
    <section className={cn('relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden', className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
              {subtitle}
            </p>
            
            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              className="bg-accent-400 hover:bg-accent-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                // Handle CTA click
                window.location.href = ctaHref;
              }}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500" />
    </section>
  );
};

export default Hero;
