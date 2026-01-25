import Sound from 'react-native-sound'

Sound.setCategory('Playback');

// Helper to wrap sound loading in a Promise
function loadSingleStrikeSound() {
  return new Promise((resolve, reject) => {
    const sound = new Sound('strike.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound:', error);
        reject(error);
      } else {
        if (!sound.isLoaded()) {
          console.warn("Sound callback succeeded but is not loaded yet.");
        }
        resolve(sound);
      }
    });
  });
}

// Load multiple sounds (returns Promise<Sound[]>)
export async function loadStrikeSounds(size) {
  const sounds = [];
  for (let i = 0; i < size; i++) {
    try {
      const sound = await loadSingleStrikeSound();
      sounds.push(sound);
    } catch (e) {
      console.error(`Error loading sound ${i}:`, e);
    }
  }
  return sounds;
}

// Release all sound instances
export function releaseStrikeSounds(arr) {
  if (!arr || !Array.isArray(arr)) return;
  arr.forEach((sound) => {
    if (sound && typeof sound.release === 'function') {
      sound.release();
    }
  });
}

// Helper to wrap sound loading in a Promise
export function loadSingleBellSound() {
  return new Promise((resolve, reject) => {
    const sound = new Sound('bell', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound:', error);
        reject(error);
      } else {
        if (!sound.isLoaded()) {
          console.warn("Sound callback succeeded but is not loaded yet.");
        }
        resolve(sound);
      }
    });
  });
}

// Release all sound instances
export function releaseBellSounds(arr) {
  if (!arr || !Array.isArray(arr)) return;
  arr.forEach((sound) => {
    if (sound && typeof sound.release === 'function') {
      sound.release();
    }
  });
}