const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressSlider = document.getElementById('progress-slider');
const currentTime = document.getElementById('current-time');
const duration = document.getElementById('duration');
const songListItems = document.getElementById('song-list-items');

const songs = [
  { title: 'Air War', artist: 'Crystal Castles', file: '1.mp3' },
  { title: 'Ketamine', artist: 'siouxxie sixxsta', file: '2.mp3' },
  { title: 'Add It Up', artist: 'Nbhd Nick', file: '3.mp3' },
  { title: 'Who Shot Cupid?', artist: 'Juice WRLD', file: '4.mp3' },
  { title: 'Sky', artist: 'Playboi Carti', file: '5.mp3' }
];

let currentSongIndex = 0;
let audioPlayer = new Audio();
let isPlaying = false;

function updatePlayerInfo() {
  const currentSong = songs[currentSongIndex];
  songTitle.textContent = currentSong.title;
  artistName.textContent = currentSong.artist;
  audioPlayer.src = currentSong.file;
}

function playSong() {
  audioPlayer.play();
  isPlaying = true;
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function togglePlayPause() {
  isPlaying ? pauseSong() : playSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updatePlayerInfo();
  playSong();
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updatePlayerInfo();
  playSong();
}

function updateProgressBar() {
  const currentTimeValue = audioPlayer.currentTime;
  const durationValue = audioPlayer.duration;
  const progress = (currentTimeValue / durationValue) * 100;
  progressSlider.value = progress;

  currentTime.textContent = formatTime(currentTimeValue);
  duration.textContent = formatTime(durationValue);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return ${minutes}:${seconds.toString().padStart(2, '0')};
}

function seekSong() {
  const seekTime = (progressSlider.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
}

function createSongList() {
  songs.forEach((song, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = ${song.title} - ${song.artist};
    listItem.addEventListener('click', () => {
      currentSongIndex = index;
      updatePlayerInfo();
      playSong();
    });
    songListItems.appendChild(listItem);
  });
}

playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
progressSlider.addEventListener('input', seekSong);
audioPlayer.addEventListener('timeupdate', updateProgressBar);

createSongList();
updatePlayerInfo();
