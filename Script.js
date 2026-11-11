const btn = document.getElementById('synapseBtn');
const text = btn.querySelector('.btn-text');
const canvas = btn.querySelector('.particle-canvas');
const ctx = canvas.getContext('2d');

// 1. Setup Canvas Dimensions
let width, height;
function resizeCanvas() {
    width = btn.offsetWidth;
    height = btn.offsetHeight;
    canvas.width = width;
    canvas.height = height;
}
// Initial setup and resize listener
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 2. Physics & Magnetic Variables
const magneticStrength = 0.4; // 0 to 1 (Higher = stronger pull to cursor)
const parallaxStrength = 0.2; // How much the text shifts inside

// 3. Magnetic & Parallax Event Listener
btn.addEventListener('mousemove', (e) => {
    // Disable transition for snappy tracking while hovering
    btn.style.transition = 'none'; 
    text.style.transition = 'none';

    // Get button position relative to viewport
    const rect = btn.getBoundingClientRect();
    
    // Find the exact center of the button
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate how far the mouse is from the center
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    // Move the button towards the mouse
    btn.style.transform = `translate(${distX * magneticStrength}px, ${distY * magneticStrength}px) scale(1.05)`;
    
    // Move the text slightly in the same direction to create 3D depth
    text.style.transform = `translate(${distX * parallaxStrength}px, ${distY * parallaxStrength}px)`;

    // Spawn a particle at the current mouse position (relative to canvas)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    createParticle(mouseX, mouseY);
});

// 4. Snap back to original position when mouse leaves
btn.addEventListener('mouseleave', () => {
    // Re-enable smooth transitions for the snap back
    btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease, background 0.4s ease';
    text.style.transition = 'transform 0.4s ease-out';
    
    // Reset transforms
    btn.style.transform = 'translate(0px, 0px) scale(1)';
    text.style.transform = 'translate(0px, 0px)';
});

// 5. Canvas Particle System Engine
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // Random size
        // Random drift direction
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.life = 1; // 100% opacity
        this.decay = Math.random() * 0.03 + 0.02; // How fast it fades
        // Alternate between neon blue and purple
        this.color = Math.random() > 0.5 ? '#00d2ff' : '#b026ff'; 
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.globalAlpha = Math.max(0, this.life); // Prevent negative alpha
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let particles = [];

function createParticle(x, y) {
    // Throttle spawn rate slightly so it doesn't get cluttered
    if (Math.random() > 0.3) { 
        particles.push(new Particle(x, y));
    }
}

function animateParticles() {
    // Clear previous frame
    ctx.clearRect(0, 0, width, height);
    
    // Loop backwards so we can safely remove dead particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        // Remove from array if fully faded out
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animateParticles); // 60 FPS Loop
}

// Start the animation loop
animateParticles();
