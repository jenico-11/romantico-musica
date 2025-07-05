const loveRain = document.getElementById('loveRain');
const phrases = [];
const colors = ['#ff4b6e', '#fff', '#ffb6c1', '#ff6f91', '#ffdde1'];

function createLovePhrase() {
  const el = document.createElement('div');
  el.className = 'love-phrase';
  el.innerText = 'Eu te Adoro';
  el.style.left = Math.random() * 90 + 'vw';
  el.style.fontSize = (Math.random() * 1.5 + 1.2) + 'em';
  el.style.color = colors[Math.floor(Math.random() * colors.length)];
  el.style.opacity = Math.random() * 0.5 + 0.5;
  el.style.top = '-2em';
  loveRain.appendChild(el);
  phrases.push(el);
}

function animateLoveRain() {
  for (let i = 0; i < phrases.length; i++) {
    const el = phrases[i];
    let top = parseFloat(el.style.top);
    top += 1 + Math.random() * 1.5;
    el.style.top = top + 'px';
    if (top > window.innerHeight + 40) {
      loveRain.removeChild(el);
      phrases.splice(i, 1);
      i--;
    }
  }
  if (Math.random() < 0.25) createLovePhrase();
  requestAnimationFrame(animateLoveRain);
}

setTimeout(animateLoveRain, 300); 