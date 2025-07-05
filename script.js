const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d');
let hearts = [];

// --- LUGARES ---
const placeForm = document.getElementById('placeForm');
const placeInput = document.getElementById('placeInput');
const placesList = document.getElementById('placesList');

// --- MODAL E FAB ---
const addPlaceFab = document.getElementById('addPlaceFab');
const placeModal = document.getElementById('placeModal');
const modalPlaceInput = document.getElementById('modalPlaceInput');
const modalAddBtn = document.getElementById('modalAddBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');

// Trocar localStorage por Firestore
// Coleção: 'passeios'
function getPlacesRealtime(callback) {
  db.collection('passeios').orderBy('createdAt').onSnapshot(snapshot => {
    const places = [];
    snapshot.forEach(doc => {
      places.push({ ...doc.data(), id: doc.id });
    });
    callback(places);
  });
}
function addPlace(name) {
  return db.collection('passeios').add({
    name,
    visited: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
function setVisited(id, visited) {
  return db.collection('passeios').doc(id).update({ visited });
}
function removePlace(id) {
  return db.collection('passeios').doc(id).delete();
}

function renderPlaces(places = null) {
  if (!places) return; // só renderiza se receber a lista
  placesList.innerHTML = '';
  if (places.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.textContent = 'Nenhum lugar adicionado ainda. Clique no + para adicionar!';
    emptyMsg.style.opacity = '0.7';
    emptyMsg.style.fontStyle = 'italic';
    emptyMsg.style.textAlign = 'center';
    placesList.appendChild(emptyMsg);
    return;
  }
  places.forEach((place) => {
    const li = document.createElement('li');
    li.className = place.visited ? 'visited' : '';
    li.innerHTML = `
      <span>${place.name}</span>
      <div>
        <input type="checkbox" ${place.visited ? 'checked' : ''} title="Marcar como visitado" />
        <button class="remove-place-btn" title="Remover">&times;</button>
      </div>
    `;
    li.querySelector('input[type="checkbox"]').addEventListener('change', function() {
      setVisited(place.id, this.checked);
    });
    li.querySelector('.remove-place-btn').addEventListener('click', function() {
      removePlace(place.id);
    });
    placesList.appendChild(li);
  });
}
// Inicializar listener em tempo real
getPlacesRealtime(renderPlaces);

// --- FIM LUGARES ---

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawHeart(x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
  ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size, x, y + size * 1.2);
  ctx.bezierCurveTo(x, y + size, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function spawnHearts(x, y) {
  // Explosão de corações - muito mais corações com movimento explosivo
  for (let i = 0; i < 25; i++) {
    const angle = (Math.PI * 2 * i) / 25;
    const speed = 3 + Math.random() * 4;
    const size = 15 + Math.random() * 20;
    
    hearts.push({
      x: x,
      y: y,
      size: size,
      color: `hsl(${Math.random() * 30 + 330}, 80%, 60%)`,
      alpha: 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Movimento para cima também
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }
}

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < hearts.length; i++) {
    let h = hearts[i];
    
    // Aplicar rotação
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation * Math.PI / 180);
    drawHeart(0, 0, h.size, h.color, h.alpha);
    ctx.restore();
    
    // Atualizar posição
    h.x += h.vx;
    h.y += h.vy;
    h.rotation += h.rotationSpeed;
    
    // Adicionar gravidade
    h.vy += 0.1;
    
    // Diminuir opacidade
    h.alpha -= 0.008;
    
    // Remover corações que saíram da tela ou ficaram transparentes
    if (h.alpha <= 0 || h.y > canvas.height + 50 || h.x < -50 || h.x > canvas.width + 50) {
      hearts.splice(i, 1);
      i--;
    }
  }
  
  requestAnimationFrame(animateHearts);
}

// Adicionar evento de clique na tela para explosão de corações
canvas.addEventListener('pointerdown', e => {
  spawnHearts(e.clientX, e.clientY);
});

// Adicionar evento do botão Vide (garantido funcionar em qualquer página)
const VideButton = document.getElementById('VideButton');
if (VideButton) {
  VideButton.addEventListener('click', function() {
    window.location.href = 'FLORES.html';
  });
}

try {
  animateHearts();

  function openModal() {
    placeModal.style.display = 'flex';
    setTimeout(() => { modalPlaceInput.focus(); }, 100);
  }
  function closeModal() {
    placeModal.style.display = 'none';
    modalPlaceInput.value = '';
  }
  if (addPlaceFab) addPlaceFab.onclick = openModal;
  if (modalCancelBtn) modalCancelBtn.onclick = closeModal;
  if (modalAddBtn) modalAddBtn.onclick = function() {
    const name = modalPlaceInput.value.trim();
    if (name) {
      addPlace(name).then(() => {
        closeModal();
      });
    }
  };
  modalPlaceInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      modalAddBtn.click();
    }
  });
  placeModal.addEventListener('click', function(e) {
    if (e.target === placeModal) closeModal();
  });
} catch (e) {
  // Silencia erros do Firebase em páginas que não usam o banco
} 