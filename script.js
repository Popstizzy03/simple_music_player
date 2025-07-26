class MusicPlayer {
  constructor() {
    this.initializeElements();
    this.initializeVariables();
    this.initializeAudioContext();
    this.setupEventListeners();
    this.setupVisualizer();
    this.loadLyrics();
    this.init();
  }

  initializeElements() {
    this.songTitle = document.getElementById('song-title');
    this.artistName = document.getElementById('artist-name');
    this.songCover = document.getElementById('song-cover');
    this.playPauseBtn = document.getElementById('play-pause-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.progressSlider = document.getElementById('progress-slider');
    this.currentTime = document.getElementById('current-time');
    this.duration = document.getElementById('duration');
    this.songListItems = document.getElementById('song-list-items');
    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.repeatBtn = document.getElementById('repeat-btn');
    this.volumeSlider = document.getElementById('volume-slider');
    this.volumeIcon = document.getElementById('volume-icon');
    this.visualizerCanvas = document.getElementById('visualizer-canvas');
    this.visualizerToggle = document.getElementById('visualizer-toggle');
    this.lyricsContent = document.getElementById('lyrics-content');
    this.helpToggle = document.getElementById('help-toggle');
    this.helpContent = document.getElementById('help-content');
  }

  initializeVariables() {
    this.songs = [
      { 
        title: 'Air War', 
        artist: 'Crystal Castles', 
        file: '1.mp3',
        lyrics: [
          { time: 0, text: "In the air war, we fight" },
          { time: 30, text: "Crystal sounds in the night" },
          { time: 60, text: "Electronic dreams collide" },
          { time: 90, text: "In this digital divide" }
        ]
      },
      { 
        title: 'Ketamine', 
        artist: 'siouxxie sixxsta', 
        file: '2.mp3',
        lyrics: [
          { time: 0, text: "Lost in the haze" },
          { time: 25, text: "Of these endless days" },
          { time: 50, text: "Searching for meaning" },
          { time: 75, text: "In this dreaming" }
        ]
      },
      { 
        title: 'Add It Up', 
        artist: 'Nbhd Nick', 
        file: '3.mp3',
        lyrics: [
          { time: 0, text: "Numbers don't lie" },
          { time: 20, text: "When we add it up" },
          { time: 40, text: "Everything counts" },
          { time: 60, text: "In this game we play" }
        ]
      },
      { 
        title: 'Who Shot Cupid?', 
        artist: 'Juice WRLD', 
        file: '4.mp3',
        lyrics: [
          { time: 0, text: "Love is a battlefield" },
          { time: 30, text: "Who shot cupid down?" },
          { time: 60, text: "Hearts are breaking" },
          { time: 90, text: "All around this town" }
        ]
      },
      { 
        title: 'Sky', 
        artist: 'Playboi Carti', 
        file: '5.mp3',
        lyrics: [
          { time: 0, text: "Looking at the sky" },
          { time: 25, text: "Wondering why" },
          { time: 50, text: "We're here tonight" },
          { time: 75, text: "Everything's alright" }
        ]
      }
    ];

    this.currentSongIndex = 0;
    this.audioPlayer = new Audio();
    this.isPlaying = false;
    this.isShuffled = false;
    this.isRepeated = false;
    this.shuffledSongList = [...this.songs];
    this.visualizerActive = false;
    this.animationId = null;
  }

  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      this.source = this.audioContext.createMediaElementSource(this.audioPlayer);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      console.log('Web Audio API not supported:', error);
    }
  }

  setupVisualizer() {
    this.canvas = this.visualizerCanvas;
    this.canvasCtx = this.canvas.getContext('2d');
    this.canvas.width = 400;
    this.canvas.height = 200;
  }

  drawVisualizer() {
    if (!this.visualizerActive || !this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    this.canvasCtx.fillStyle = 'rgba(26, 26, 26, 0.2)';
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;

      const gradient = this.canvasCtx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
      gradient.addColorStop(0, `hsl(${(i / this.bufferLength) * 360}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${(i / this.bufferLength) * 360}, 70%, 30%)`);

      this.canvasCtx.fillStyle = gradient;
      this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    this.animationId = requestAnimationFrame(() => this.drawVisualizer());
  }

  toggleVisualizer() {
    this.visualizerActive = !this.visualizerActive;
    this.visualizerToggle.classList.toggle('active', this.visualizerActive);
    
    if (this.visualizerActive) {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.drawVisualizer();
    } else {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  loadLyrics() {
    const currentSong = this.songs[this.currentSongIndex];
    if (currentSong.lyrics) {
      this.lyricsContent.innerHTML = '';
      currentSong.lyrics.forEach((line, index) => {
        const lyricsLine = document.createElement('p');
        lyricsLine.className = 'lyrics-line';
        lyricsLine.textContent = line.text;
        lyricsLine.dataset.time = line.time;
        lyricsLine.addEventListener('click', () => {
          this.audioPlayer.currentTime = line.time;
        });
        this.lyricsContent.appendChild(lyricsLine);
      });
    } else {
      this.lyricsContent.innerHTML = '<p>No lyrics available for this song</p>';
    }
  }

  updateLyricsHighlight() {
    const currentTime = this.audioPlayer.currentTime;
    const lyricsLines = this.lyricsContent.querySelectorAll('.lyrics-line');
    const currentSong = this.songs[this.currentSongIndex];
    
    if (!currentSong.lyrics) return;

    lyricsLines.forEach((line, index) => {
      line.classList.remove('active');
      const lineTime = parseFloat(line.dataset.time);
      const nextLineTime = index < currentSong.lyrics.length - 1 ? currentSong.lyrics[index + 1].time : Infinity;
      
      if (currentTime >= lineTime && currentTime < nextLineTime) {
        line.classList.add('active');
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  updatePlayerInfo() {
    const currentSong = this.songs[this.currentSongIndex];
    this.songTitle.textContent = currentSong.title;
    this.artistName.textContent = currentSong.artist;
    this.audioPlayer.src = currentSong.file;
    this.loadLyrics();
  }

  playSong() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.audioPlayer.play();
    this.isPlaying = true;
    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }

  pauseSong() {
    this.audioPlayer.pause();
    this.isPlaying = false;
    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }

  togglePlayPause() {
    this.isPlaying ? this.pauseSong() : this.playSong();
  }

  prevSong() {
    this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
    this.updatePlayerInfo();
    if (this.isPlaying) this.playSong();
  }

  nextSong() {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.updatePlayerInfo();
    if (this.isPlaying) this.playSong();
  }

  updateProgressBar() {
    const currentTimeValue = this.audioPlayer.currentTime;
    const durationValue = this.audioPlayer.duration;

    if (!isNaN(durationValue)) {
      const progress = (currentTimeValue / durationValue) * 100;
      this.progressSlider.value = progress;

      this.currentTime.textContent = this.formatTime(currentTimeValue);
      this.duration.textContent = this.formatTime(durationValue);
      
      this.updateLyricsHighlight();
    }
  }

  formatTime(time) {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  seekSong() {
    const seekTime = (this.progressSlider.value / 100) * this.audioPlayer.duration;
    this.audioPlayer.currentTime = seekTime;
  }

  createSongList() {
    this.songListItems.innerHTML = '';
    this.songs.forEach((song, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span>${song.title} - ${song.artist}</span>
        <span class="song-duration"></span>
      `;
      listItem.addEventListener('click', () => {
        this.currentSongIndex = index;
        this.updatePlayerInfo();
        this.playSong();
      });

      this.songListItems.appendChild(listItem);
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.shuffleBtn.classList.toggle('active', this.isShuffled);
    
    if (this.isShuffled) {
      this.shuffleArray(this.shuffledSongList);
    } else {
      this.shuffledSongList = [...this.songs];
    }
  }

  toggleRepeat() {
    this.isRepeated = !this.isRepeated;
    this.repeatBtn.classList.toggle('active', this.isRepeated);
  }

  setVolume() {
    this.audioPlayer.volume = this.volumeSlider.value / 100;
    
    this.volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute');
    
    if (this.audioPlayer.volume === 0) {
      this.volumeIcon.classList.add('fa-volume-mute');
    } else if (this.audioPlayer.volume < 0.5) {
      this.volumeIcon.classList.add('fa-volume-down');
    } else {
      this.volumeIcon.classList.add('fa-volume-up');
    }
  }

  muteVolume() {
    if (this.audioPlayer.volume > 0) {
      this.audioPlayer.muted = true;
      this.volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
      this.volumeIcon.classList.add('fa-volume-mute');
      this.volumeSlider.value = 0;
    } else {
      this.audioPlayer.muted = false;
      this.setVolume();
      this.volumeSlider.value = this.audioPlayer.volume * 100;
    }
  }

  setupEventListeners() {
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.prevBtn.addEventListener('click', () => this.prevSong());
    this.nextBtn.addEventListener('click', () => this.nextSong());
    this.progressSlider.addEventListener('input', () => this.seekSong());
    this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
    this.volumeSlider.addEventListener('input', () => this.setVolume());
    this.volumeIcon.addEventListener('click', () => this.muteVolume());
    this.visualizerToggle.addEventListener('click', () => this.toggleVisualizer());
    this.helpToggle.addEventListener('click', () => this.toggleHelp());

    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgressBar());
    this.audioPlayer.addEventListener('ended', () => {
      if (this.isRepeated) {
        this.playSong();
      } else {
        this.nextSong();
      }
    });

    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.duration.textContent = this.formatTime(this.audioPlayer.duration);
    });

    this.audioPlayer.addEventListener('play', () => {
      document.body.classList.add('playing');
      document.body.classList.remove('paused');
    });

    this.audioPlayer.addEventListener('pause', () => {
      document.body.classList.add('paused');
      document.body.classList.remove('playing');
    });

    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  toggleHelp() {
    this.helpContent.classList.toggle('hidden');
    this.helpToggle.classList.toggle('active', !this.helpContent.classList.contains('hidden'));
  }

  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        this.togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.audioPlayer.currentTime = Math.max(0, this.audioPlayer.currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.audioPlayer.currentTime = Math.min(this.audioPlayer.duration, this.audioPlayer.currentTime + 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.volumeSlider.value = Math.min(100, parseInt(this.volumeSlider.value) + 10);
        this.setVolume();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.volumeSlider.value = Math.max(0, parseInt(this.volumeSlider.value) - 10);
        this.setVolume();
        break;
      case 'KeyN':
        e.preventDefault();
        this.nextSong();
        break;
      case 'KeyP':
        e.preventDefault();
        this.prevSong();
        break;
      case 'KeyM':
        e.preventDefault();
        this.muteVolume();
        break;
      case 'KeyS':
        e.preventDefault();
        this.toggleShuffle();
        break;
      case 'KeyR':
        e.preventDefault();
        this.toggleRepeat();
        break;
      case 'KeyV':
        e.preventDefault();
        this.toggleVisualizer();
        break;
      case 'KeyH':
        e.preventDefault();
        this.toggleHelp();
        break;
    }
  }

  init() {
    this.updatePlayerInfo();
    this.createSongList();
    this.setVolume();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MusicPlayer();
});