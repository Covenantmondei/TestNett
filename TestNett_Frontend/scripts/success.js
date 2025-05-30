let seconds = 8;
const countdownEl = document.getElementById('countdown');

const countdown = setInterval(() => {
  seconds--;
  countdownEl.textContent = seconds;
  if (seconds <= 0) {
    clearInterval(countdown);
    window.location.href = 'dashboard.html';
  }
}, 1000);