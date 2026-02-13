// Text reveal animation
const messages = ["msg1", "msg2", "msg3", "msg4", "msg5", "msg6", "msg7", "msg8", "msg9", "msg10", "msg11", "msg12", "msg13", "msg14", "msg15", "msg16", "msg17", "msg18", "msg19", "msg20", "msg21", "msg22", "msg23", "msg24", "msg25", "msg26"];
let currentMessage = 0;

function showMessages() {
    if (currentMessage < messages.length) {
        const element = document.getElementById(messages[currentMessage]);
        if (element) {
            element.classList.add('show');
        }
        currentMessage++;
        
        // Faster reveal for messages
        const delay = currentMessage <= 3 ? 2500 : 1500;
        setTimeout(showMessages, delay);
    } else {
        // Show heart beat after all messages
        const heartBeat = document.getElementById('heartBeat');
        if (heartBeat) {
            heartBeat.classList.add('show');
        }
    }
}

// Create floating hearts
function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    const heartEmojis = ['💖', '💕', '💗', '💓', '💝', '💘', '❤️'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            heart.remove();
        }, 10000);
    }, 800);
}

// Handle Yes button
function moveYes(button) {
    // Small hover effect instead of moving away
    button.style.transform = 'scale(1.05)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function selectYes() {
    // Show success message
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.add('show');
    }
    
    // Send response to server
    saveResponse('yes');
    
    // Add celebration hearts
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const container = document.getElementById('heartsContainer');
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '💕';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = (Math.random() * 30 + 20) + 'px';
            heart.style.animationDuration = '4s';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 8000);
        }, i * 100);
    }
}

// Handle No button
function moveNo(button) {
    // Move button away randomly
    const section = document.getElementById('section3');
    const rect = section.getBoundingClientRect();
    const maxX = rect.width - button.offsetWidth;
    const maxY = rect.height - button.offsetHeight;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    button.style.position = 'fixed';
    button.style.left = newX + 'px';
    button.style.top = newY + 'px';
    button.style.transition = 'all 0.3s ease';
    
    // Send response to server
    saveResponse('no');
}

// Save response to server
function saveResponse(answer) {
    const timestamp = new Date().toISOString();
    
    fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: answer, timestamp })
    }).then(response => {
        if (response.ok) {
            console.log('Response saved to server:', answer);
        }
    }).catch(err => {
        console.log('Server not running, saving locally');
        // Fallback: save to localStorage
        const localData = JSON.parse(localStorage.getItem('responses') || '{"yes":0,"no":0,"records":[]}');
        localData[answer]++;
        localData.records.push({ response: answer, timestamp, name: 'Anonymous' });
        localStorage.setItem('responses', JSON.stringify(localData));
    });
}

// Audio player status
function setupAudioPlayer() {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioStatus = document.getElementById('audioStatus');
    
    if (audioPlayer && audioStatus) {
        audioPlayer.addEventListener('play', () => {
            audioStatus.textContent = '🎶 Playing...';
        });
        
        audioPlayer.addEventListener('pause', () => {
            audioStatus.textContent = '⏸️ Paused';
        });
        
        audioPlayer.addEventListener('ended', () => {
            audioStatus.textContent = '✨ Click to replay';
        });
    }
}

// Initialize on page load
window.onload = function() {
    // Start message animation after a short delay
    setTimeout(showMessages, 1000);
    
    // Create floating hearts
    createFloatingHearts();
    
    // Setup audio player
    setupAudioPlayer();
};
