// Mutable, non-reactive scroll signal shared between GSAP ScrollTrigger
// (DOM side, updates on scroll) and the R3F render loop (WebGL side,
// reads it every frame via useFrame). Deliberately not React state — this
// can update up to 60x/sec and must never trigger a component re-render.
export const heroSceneProgress = {
  value: 0,
  active: true,
};
