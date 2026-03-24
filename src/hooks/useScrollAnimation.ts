import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function useScrollAnimation<T extends HTMLElement>(
  animationCallback: (element: T, gsapInstance: typeof gsap) => gsap.core.Timeline | gsap.core.Tween | void,
  _options: ScrollAnimationOptions = {}
) {
  const elementRef = useRef<T>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const animation = animationCallback(element, gsap);
      if (animation) {
        animationRef.current = animation;
      }
    }, element);

    return () => {
      ctx.revert();
    };
  }, [animationCallback]);

  return elementRef;
}

export function useFadeInOnScroll<T extends HTMLElement>(delay = 0) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, y: 24 });

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === element)
        .forEach(st => st.kill());
    };
  }, [delay]);

  return elementRef;
}

export function useStaggerReveal<T extends HTMLElement>(
  childSelector: string,
  staggerDelay = 0.1
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y: 30 });

    const animation = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: staggerDelay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === container)
        .forEach(st => st.kill());
    };
  }, [childSelector, staggerDelay]);

  return containerRef;
}

export function useParallax(speed = 0.5) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animation = gsap.to(element, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === element)
        .forEach(st => st.kill());
    };
  }, [speed]);

  return elementRef;
}

export function useHorizontalScroll<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const scrollWidth = track.scrollWidth - container.offsetWidth;
    
    if (scrollWidth <= 0) return;

    const animation = gsap.to(track, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: `+=${scrollWidth}`,
        scrub: 1,
        pin: false,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === container)
        .forEach(st => st.kill());
    };
  }, []);

  return { containerRef, trackRef };
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach(st => st.kill());
}
