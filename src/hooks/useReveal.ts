import { useEffect, useRef } from 'react';

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observeReveals = () => {
      const children = element.querySelectorAll('.reveal:not(.visible)');
      children.forEach((child) => observer.observe(child));
    };

    observeReveals();

    // Watch for dynamically added .reveal elements (e.g. after async data loads)
    const mutationObserver = new MutationObserver(() => {
      observeReveals();
    });

    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}
