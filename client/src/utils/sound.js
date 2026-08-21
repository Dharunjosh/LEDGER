// Audio Engine & Sound Synthesis for TeamFlow
// Provides high-fidelity Web Audio API presets and custom audio file playback

const DEFAULT_SOUND_SETTINGS = {
  enabled: true,
  preset: "chime", // 'chime' | 'bell' | 'pulse' | 'marimba' | 'harp' | 'radar' | 'custom'
  volume: 80, // 0 to 100
  customSoundData: null, // Base64 audio string or URL
  customSoundName: null, // Original file name
  taskSoundEnabled: true,
};

export const PRESET_OPTIONS = [
  { id: "chime", name: "Gentle Chime", desc: "Smooth harmonious chime" },
  { id: "bell", name: "Crystal Bell", desc: "Crisp resonating tone" },
  { id: "pulse", name: "Digital Pulse", desc: "Modern double-beep" },
  { id: "marimba", name: "Warm Marimba", desc: "Soothing wooden tones" },
  { id: "harp", name: "Ascending Harp", desc: "Uplifting melodic arpeggio" },
  { id: "radar", name: "Radar Ping", desc: "Clear alert ping" },
];

export function getSoundSettings() {
  try {
    const saved = localStorage.getItem("ledger:sound-settings") || localStorage.getItem("teamflow:sound-settings");
    if (saved) {
      return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Failed to load sound settings:", e);
  }
  return DEFAULT_SOUND_SETTINGS;
}

export function saveSoundSettings(settings) {
  try {
    localStorage.setItem("ledger:sound-settings", JSON.stringify(settings));
    localStorage.setItem("teamflow:sound-settings", JSON.stringify(settings));
    // Dispatch storage event so other components or tabs update instantly
    window.dispatchEvent(new CustomEvent("ledger-sound-settings-changed", { detail: settings }));
    window.dispatchEvent(new CustomEvent("teamflow-sound-settings-changed", { detail: settings }));
  } catch (e) {
    console.warn("Failed to save sound settings:", e);
  }
}

// Audio Context Singleton for Web Audio API
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes a tone using Web Audio API
 */
function playSynthesizedTone({ freqs = [440], type = "sine", duration = 0.5, stagger = 0.08, gainMultiplier = 0.3, volume = 80 }) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const effectiveVolume = (Math.max(0, Math.min(100, volume)) / 100) * gainMultiplier;
    masterGain.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + index * stagger;
      const endTime = startTime + duration;

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(1, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(endTime);
    });
  } catch (e) {
    console.warn("Audio synthesis error:", e);
  }
}

/**
 * Play a specific preset sound
 */
export function playPreset(presetId, volume = 80) {
  switch (presetId) {
    case "bell":
      // Crystal Bell - High resonant bells
      playSynthesizedTone({
        freqs: [880, 1320, 1760],
        type: "sine",
        duration: 0.9,
        stagger: 0.05,
        gainMultiplier: 0.25,
        volume,
      });
      break;

    case "pulse":
      // Modern Digital Pulse - Two crisp pulses
      playSynthesizedTone({
        freqs: [587.33, 880],
        type: "triangle",
        duration: 0.15,
        stagger: 0.12,
        gainMultiplier: 0.28,
        volume,
      });
      break;

    case "marimba":
      // Warm Marimba - Pleasant chord progression
      playSynthesizedTone({
        freqs: [329.63, 392.0, 523.25, 659.25],
        type: "sine",
        duration: 0.45,
        stagger: 0.09,
        gainMultiplier: 0.3,
        volume,
      });
      break;

    case "harp":
      // Ascending Harp - Ascending pentatonic arpeggio
      playSynthesizedTone({
        freqs: [440, 554.37, 659.25, 830.61, 880],
        type: "sine",
        duration: 0.6,
        stagger: 0.06,
        gainMultiplier: 0.22,
        volume,
      });
      break;

    case "radar":
      // Sonar Radar Ping
      playSynthesizedTone({
        freqs: [1046.5, 1318.51],
        type: "sine",
        duration: 0.7,
        stagger: 0.03,
        gainMultiplier: 0.25,
        volume,
      });
      break;

    case "chime":
    default:
      // Gentle Chime - Soothing major chord
      playSynthesizedTone({
        freqs: [523.25, 659.25, 783.99, 1046.5],
        type: "sine",
        duration: 0.8,
        stagger: 0.07,
        gainMultiplier: 0.25,
        volume,
      });
      break;
  }
}

/**
 * Play a custom audio file from Base64 or Blob URL
 */
export function playCustomAudio(audioData, volume = 80) {
  if (!audioData) return;
  try {
    const audio = new Audio(audioData);
    audio.volume = Math.max(0, Math.min(100, volume)) / 100;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Could not play custom audio file:", err);
      });
    }
  } catch (e) {
    console.warn("Audio playback error:", e);
  }
}

/**
 * Main function to play reminder alert sound based on user settings
 */
export function playReminderSound() {
  const settings = getSoundSettings();
  if (!settings.enabled) return;

  if (settings.preset === "custom" && settings.customSoundData) {
    playCustomAudio(settings.customSoundData, settings.volume);
  } else {
    playPreset(settings.preset || "chime", settings.volume);
  }
}

/**
 * Play sound for task completion celebration
 */
export function playTaskDoneSound() {
  const settings = getSoundSettings();
  if (!settings.enabled || !settings.taskSoundEnabled) return;

  playSynthesizedTone({
    freqs: [523.25, 659.25, 783.99, 1046.5],
    type: "sine",
    duration: 0.35,
    stagger: 0.05,
    gainMultiplier: 0.2,
    volume: settings.volume,
  });
}

/**
 * Test a sound configuration
 */
export function testSound(presetId, customData, volume = 80) {
  if (presetId === "custom" && customData) {
    playCustomAudio(customData, volume);
  } else {
    playPreset(presetId || "chime", volume);
  }
}
