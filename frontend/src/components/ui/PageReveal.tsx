import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const MAX_REVEAL_DEPTH = 2;
const STAGGER_STEP_MS = 70;
const MAX_STAGGER_MS = 420;
const OBSERVER_WINDOW_MS = 2000;

const isHTMLElement = (node: Element): node is HTMLElement => node instanceof HTMLElement;

const getEligibleChildren = (parent: ParentNode) =>
  Array.from(parent.children)
    .filter(isHTMLElement)
    .filter((element) => {
      if (element.dataset.ffRevealSkip !== undefined) return false;
      if (element.closest('[data-ff-reveal-skip]')) return false;
      if (element.classList.contains('hidden')) return false;
      if (element.classList.contains('fixed')) return false;
      if (element.classList.contains('absolute')) return false;
      if (element.getAttribute('aria-hidden') === 'true') return false;
      return element.getClientRects().length > 0;
    });

const hasLayoutClasses = (element: HTMLElement) => {
  const tokens = Array.from(element.classList);
  return (
    tokens.includes('grid') ||
    tokens.includes('flex') ||
    tokens.some((token) =>
      token.startsWith('gap-') ||
      token.startsWith('space-y-') ||
      token.startsWith('grid-cols-') ||
      token.endsWith(':grid') ||
      token.includes(':grid-cols-') ||
      token.endsWith(':flex') ||
      token.includes(':gap-') ||
      token.includes(':space-y-')
    )
  );
};

const shouldSplitContainer = (element: HTMLElement, depth: number) => {
  const children = getEligibleChildren(element);
  if (children.length < 2) return false;

  if (depth === 0 && element.tagName === 'DIV') {
    return true;
  }

  return hasLayoutClasses(element);
};

const collectTargets = (elements: HTMLElement[], depth = 0): HTMLElement[] => {
  const targets: HTMLElement[] = [];

  elements.forEach((element) => {
    if (depth < MAX_REVEAL_DEPTH && shouldSplitContainer(element, depth)) {
      targets.push(...collectTargets(getEligibleChildren(element), depth + 1));
      return;
    }

    targets.push(element);
  });

  return targets;
};

const getRevealTargets = (container: HTMLElement) => {
  const rootChildren = getEligibleChildren(container);
  const nonFixedChildren = rootChildren.filter((element) => !element.classList.contains('fixed'));

  if (nonFixedChildren.length === 1) {
    const rootContent = nonFixedChildren[0];
    const rootContentChildren = getEligibleChildren(rootContent);
    if (rootContentChildren.length >= 2) {
      return collectTargets(rootContentChildren);
    }
  }

  return collectTargets(nonFixedChildren);
};

const PageReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef(0);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    cycleRef.current += 1;
    const cycleId = String(cycleRef.current);
    let staggerIndex = 0;
    let revealFrame = 0;
    let mutationFrame = 0;

    const revealTargets = (targets: HTMLElement[]) => {
      const freshTargets = targets.filter((element) => element.dataset.ffPageLoadCycle !== cycleId);
      if (freshTargets.length === 0) return;

      freshTargets.forEach((element) => {
        element.dataset.ffPageLoadCycle = cycleId;
        element.dataset.ffPageLoad = 'pending';
        element.style.setProperty('--ff-page-load-delay', `${Math.min(staggerIndex * STAGGER_STEP_MS, MAX_STAGGER_MS)}ms`);
        staggerIndex += 1;
      });

      const batch = [...freshTargets];
      revealFrame = window.requestAnimationFrame(() => {
        batch.forEach((element) => {
          if (!element.isConnected) return;
          if (element.dataset.ffPageLoadCycle !== cycleId) return;
          element.dataset.ffPageLoad = 'visible';
        });
      });
    };

    revealTargets(getRevealTargets(container));

    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(mutationFrame);
      mutationFrame = window.requestAnimationFrame(() => {
        revealTargets(getRevealTargets(container));
      });
    });

    observer.observe(container, { childList: true, subtree: true });

    const observerTimer = window.setTimeout(() => {
      observer.disconnect();
    }, OBSERVER_WINDOW_MS);

    return () => {
      window.cancelAnimationFrame(revealFrame);
      window.cancelAnimationFrame(mutationFrame);
      window.clearTimeout(observerTimer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="ff-page-load-shell">
      {children}
    </div>
  );
};

export default PageReveal;
