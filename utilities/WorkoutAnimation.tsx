// File: WorkoutAnimation.tsx
// Author: Tony Jordan
// Purpose: Functionality for pausing workout, and iterating between strikes in generated combos.

import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound'

// Pausable Interval for use during strike throws for combos
export function usePauseableInterval(
  paused: boolean,
  interval: number,
  activeStates: boolean[],
  setActiveStates: React.Dispatch<React.SetStateAction<boolean[]>>,
  setY: React.Dispatch<React.SetStateAction<number>>,
  repeats: number,
  onRepeatComplete: () => void,
  onAllComplete: () => void,
  strikeSounds?: Sound[]
) {
  const indexRef = useRef(0);
  const iterationRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const rafId = useRef<number | null>(null);

  // when initializing, set indexRef.current to 0 to prevent sound issues
  useEffect(() => {
    indexRef.current = 0;
    // set Y to NaN to remove 'current strike' from the center of user interface
    setY(NaN);
    // skip if user paused this menu
    if (paused) return;
    // animation configuration
    const step = (timestamp: number) => {
      if (paused) {
        lastTimeRef.current = null;
        rafId.current = requestAnimationFrame(step);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      accumulatedRef.current += delta;

      // if statement for time between strikes
      if (accumulatedRef.current >= interval) {
        accumulatedRef.current = 0;
        // move to next index of active states
        const updated = new Array(activeStates.length).fill(false);
        if (indexRef.current < updated.length) {
          updated[indexRef.current] = true;
          setActiveStates(updated);
          setY(indexRef.current);
          indexRef.current++;
        }
        if (strikeSounds && strikeSounds.length > 0) {
          if (indexRef.current > 1)
            strikeSounds[indexRef.current - 2].stop();
        
          strikeSounds[indexRef.current - 1].play((success) => {
            if (!success) {
              console.log('failed to play sound')
            }
          });
        }

        
        if (indexRef.current >= activeStates.length) {
          // increment iteration at the end of a single combo throw
          iterationRef.current++;

          // Wait for interval amount of time to set time delay for last remaining strike in a combo
          setTimeout(() => {
            // if iterations are complete, move on to next combo
            if (iterationRef.current >= repeats) {
              onAllComplete();
              iterationRef.current = 0;
            } else {
              onRepeatComplete();
              const updated = new Array(activeStates.length).fill(false);
              setActiveStates(updated);
              indexRef.current = NaN;
              setY(NaN);
            }
          }, interval);
          return;
        }
      }

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [paused, interval, activeStates.length, setActiveStates, strikeSounds]);
}

// Pausable Timeout for use in between combos
export function usePausableTimeout(
  paused: boolean,
  time: number,
  onComplete: () => void,
  key: number,
  setWait: React.Dispatch<React.SetStateAction<string>>, 
  setWaiting: React.Dispatch<React.SetStateAction<boolean>> 
) {
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const rafId = useRef<number | null>(null);

  // request animation frame to make sequence pauseable.
  useEffect(() => {
    startTimeRef.current = null;
    elapsedRef.current = 0;

    const step = (timestamp: number) => {
      setWaiting(true);
      if (paused) {
        startTimeRef.current = null;
        rafId.current = requestAnimationFrame(step);
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const delta = timestamp - startTimeRef.current;
      startTimeRef.current = timestamp;
      elapsedRef.current += delta;

      // interval will always be a multiple of 1000
      setWait(((time/1000) - Math.round((elapsedRef.current / 100))/10).toString().slice(0, 3))

      if (elapsedRef.current >= time) {
        setWaiting(false);
        onComplete();
        return;
      }

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [paused, time, key]);
}
