let audioContext = null;
let musicTimeout = null;

let noteFrequencies = {
    B4: 493.88,
    C5: 523.25,
    DS5: 622.25,
    E5: 659.25,
    F5: 698.46,
    FS5: 739.99,
    G5: 783.99,
    GS5: 830.61,
    A5: 880.0,
    B5: 987.77,
    C6: 1046.5,
};

let sixteenthDuration = 0.085;

let pacmanTheme = [
    ["B4", 2], ["B5", 2], ["FS5", 2], ["DS5", 2], ["B5", 4], ["FS5", 2], ["DS5", 4],
    ["C5", 2], ["C6", 2], ["G5", 2], ["E5", 2], ["C6", 4], ["G5", 2], ["E5", 4],
    ["B4", 2], ["B5", 2], ["FS5", 2], ["DS5", 2], ["B5", 4], ["FS5", 2], ["DS5", 4],
    ["DS5", 2], ["E5", 2], ["F5", 4], ["F5", 2], ["FS5", 2], ["G5", 4],
    ["G5", 2], ["GS5", 2], ["A5", 4], ["B5", 4],
];

let schedulePacmanTheme = () => {
    let startTime = audioContext.currentTime + 0.08;
    let cursor = startTime;
    for (let i = 0; i < pacmanTheme.length; i++) {
        let frequency = noteFrequencies[pacmanTheme[i][0]];
        let duration = pacmanTheme[i][1] * sixteenthDuration;

        let oscillator = audioContext.createOscillator();
        let gain = audioContext.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, cursor);
        gain.gain.exponentialRampToValueAtTime(0.05, cursor + 0.01);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            cursor + duration * 0.9
        );
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(cursor);
        oscillator.stop(cursor + duration);
        cursor += duration;
    }
    musicTimeout = setTimeout(
        schedulePacmanTheme,
        (cursor - startTime + 0.6) * 1000
    );
};

let startPacmanMusic = () => {
    if (audioContext) {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        return;
    }
    let AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        return;
    }
    audioContext = new AudioCtx();
    schedulePacmanTheme();
};

let stopPacmanMusic = () => {
    if (musicTimeout) {
        clearTimeout(musicTimeout);
        musicTimeout = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
};
