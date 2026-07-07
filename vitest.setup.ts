import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver implementation. framer-motion's
// `whileInView` (used throughout the marketing sections, e.g. AnimatedSection,
// PricingObjections) calls it on mount, so any test rendering those
// components needs this stub or React throws a ReferenceError during effects.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

global.IntersectionObserver = MockIntersectionObserver;
