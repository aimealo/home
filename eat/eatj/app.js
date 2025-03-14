const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let currentRotation = 0;
let isSpinning = false;
let timeoutId = null;
let particles = [];
let history = [];

const spinSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
const winSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');

const items = [
    'サラダボウル', 'Sサンドイッチ', 'ブリトー', '寿司', 'ピザ', 'Bバーガーコンボ', 'Bバーガーコンボ', '牛丼', 'Bうどん','おにぎりl', '味噌ラーメン', '天ぷらラーメン', 'マクドナルド', 'マクドナルド', 'マクドナルド'
];

function generateSVGIcon(size) {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}" fill="#ee7752"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#fff" font-size="${size/3}" font-family="Microsoft JhengHei">吃</text>
        </svg>`;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function addToHistory(item) {
    history.unshift({
        item: item,
        time: new Date().toLocaleTimeString()
    });
    if (history.length > 5) history.pop();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = history
        .map(h => `<div class="history-item">${h.time}: ${h.item}</div>`)
        .join('');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    canvas.width = size;
    canvas.height = size;
    drawWheel();
}

function drawWheel(highlightIndex = -1) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    const sliceAngle = (Math.PI * 2) / items.length;

    items.forEach((item, i) => {
        const angle = i * sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = `hsl(${(i * 360 / items.length)}, 70%, 60%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = 'right';

        if (i === highlightIndex) {
            ctx.font = `${radius / 15 * 2}px Microsoft JhengHei`; // 移除 bold，改為細體
            ctx.strokeStyle = '#000'; // 黑色描邊
            ctx.lineWidth = 2;
            ctx.fillStyle = '#ffd700'; // 金黃色填充
            ctx.strokeText(item, radius - 30, 0);
            ctx.fillText(item, radius - 30, 0);
        } else {
            ctx.fillStyle = '#000'; // 普通文字保持白色
            ctx.font = `${radius / 15}px Microsoft JhengHei`; // 移除 bold，改為細體
            ctx.fillText(item, radius - 20, 0);
        }
        ctx.restore();
    });

    ctx.restore();
}
function createParticles() {
    if (isSpinning) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        particles.push(new Particle(centerX, centerY));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].size <= 0.2) {
            particles.splice(i, 1);
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWheel();
    createParticles();
    updateParticles();
    requestAnimationFrame(animate);
}

function startSpin() {
    if (isSpinning) return;
    isSpinning = true;

    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0rad)';
    currentRotation = 0;
    canvas.offsetHeight;

    canvas.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';

    spinSound.play();

    const extraSpins = 5;
    const targetSlice = Math.floor(Math.random() * items.length);
    const targetRotation = extraSpins * Math.PI * 2 + 
                         (Math.PI * 2 - (targetSlice * (Math.PI * 2) / items.length));

    requestAnimationFrame(() => {
        canvas.style.transform = `rotate(${targetRotation}rad)`;
    });

    setTimeout(() => {
        isSpinning = false;
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        winSound.play();
        const winner = items[targetSlice];
        addToHistory(winner);
        highlightWinner(targetSlice);
        resetTimeout();
    }, 3000);
}

function highlightWinner(index) {
    let blinkCount = 0;
    const radius = canvas.width / 2 - 10;
    const sliceAngle = (Math.PI * 2) / items.length;
    const historyDiv = document.getElementById('history');
    const winnerText = items[index];

    const tempWinner = document.createElement('div');
    tempWinner.className = 'history-item blink';
    tempWinner.textContent = winnerText;
    tempWinner.style.color = '#ffd700';
    historyDiv.insertBefore(tempWinner, historyDiv.firstChild);

    const blinkInterval = setInterval(() => {
        if (blinkCount >= 4) {
            clearInterval(blinkInterval);
            
            setTimeout(() => {
                if (tempWinner.parentNode) {
                    tempWinner.parentNode.removeChild(tempWinner);
                }
            }, 3000);

            const highlightInterval = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawWheel(index);
                updateParticles();
            }, 16);
            
            setTimeout(() => {
                clearInterval(highlightInterval);
                animate();
            }, 5000);

            return;
        }

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentRotation);
        
        items.forEach((item, i) => {
            const angle = i * sliceAngle;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = i === index && blinkCount % 2 === 0 ? '#ffd700' : `hsl(${(i * 360 / items.length)}, 70%, 60%)`;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.stroke();

            ctx.save();
            ctx.rotate(angle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff'; // 閃爍期間文字白色
            ctx.font = `${radius / 15}px Microsoft JhengHei`; // 移除 bold，改為細體
            ctx.fillText(item, radius - 20, 0);
            ctx.restore();
        });

        ctx.restore();
        blinkCount++;
    }, 500);
}

function resetTimeout() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        window.location.href = 'index.html';
    }, 30000);
}

// 初始化
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}