// Game canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game elements
const scoreDisplay = document.getElementById('score-display');
const finalScore = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let frames = 0;

// Game settings
const gravity = 0.15;
const jumpForce = -5;
const pipeGap = 130;
const pipeWidth = 52;
const pipeInterval = 100; // Frames between pipe spawns

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 3,
    width: 34,
    height: 24,
    velocity: 0,
    
    draw: function() {
        ctx.fillStyle = '#f8c548'; // Yellow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.height / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird's eye
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird's beak
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 12, this.y + 5);
        ctx.fill();
        
        // Bird's wing
        ctx.fillStyle = '#e6b800';
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y + 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    },
    
    update: function() {
        if (gameStarted && !gameOver) {
            this.velocity += gravity;
            this.y += this.velocity;
            
            // Floor collision
            if (this.y + this.height / 2 >= canvas.height - foreground.height) {
                this.y = canvas.height - foreground.height - this.height / 2;
                endGame();
            }
            
            // Ceiling collision
            if (this.y - this.height / 2 <= 0) {
                this.y = this.height / 2;
                this.velocity = 0;
            }
        }
    },
    
    flap: function() {
        if (!gameOver) {
            this.velocity = jumpForce;
        }
    },
    
    reset: function() {
        this.y = canvas.height / 3;
        this.velocity = 0;
    }
};

// Pipes array
const pipes = [];

// Pipe object constructor
function Pipe() {
    this.x = canvas.width;
    this.width = pipeWidth;
    this.topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - foreground.height - 60)) + 20;
    this.bottomHeight = canvas.height - this.topHeight - pipeGap - foreground.height;
    
    this.draw = function() {
        // Top pipe
        ctx.fillStyle = '#74c010'; // Green
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        
        // Pipe cap (top)
        ctx.fillStyle = '#8ed814';
        ctx.fillRect(this.x - 2, this.topHeight - 10, this.width + 4, 10);
        
        // Bottom pipe
        ctx.fillStyle = '#74c010';
        ctx.fillRect(this.x, canvas.height - this.bottomHeight - foreground.height, this.width, this.bottomHeight);
        
        // Pipe cap (bottom)
        ctx.fillStyle = '#8ed814';
        ctx.fillRect(this.x - 2, canvas.height - this.bottomHeight - foreground.height, this.width + 4, 10);
    };
    
    this.update = function() {
        if (gameStarted && !gameOver) {
            this.x -= 2;
        }
        
        // Check if pipe is off screen
        if (this.x + this.width < 0) {
            return true;
        }
        
        // Check collision with bird
        if (
            bird.x + bird.width / 2 > this.x && 
            bird.x - bird.width / 2 < this.x + this.width && 
            (bird.y - bird.height / 2 < this.topHeight || 
             bird.y + bird.height / 2 > canvas.height - this.bottomHeight - foreground.height)
        ) {
            endGame();
        }
        
        // Check if bird passed the pipe
        if (bird.x > this.x + this.width && !this.passed) {
            score++;
            scoreDisplay.textContent = score;
            this.passed = true;
        }
        
        return false;
    };
}

// Foreground object
const foreground = {
    height: 80,
    
    draw: function() {
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, canvas.height - this.height, canvas.width, this.height);
        
        // Add some texture to the ground
        ctx.fillStyle = '#c9b659';
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.fillRect(i, canvas.height - this.height + 15, 15, 5);
        }
    }
};

// Background objects
const background = {
    draw: function() {
        // Sky
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Clouds
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(80, 80, 20, 0, Math.PI * 2);
        ctx.arc(100, 70, 25, 0, Math.PI * 2);
        ctx.arc(120, 85, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(250, 100, 20, 0, Math.PI * 2);
        ctx.arc(270, 90, 25, 0, Math.PI * 2);
        ctx.arc(290, 105, 15, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Game functions
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    frames = 0;
    pipes.length = 0;
    bird.reset();
    
    scoreDisplay.textContent = score;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    animate();
}

function endGame() {
    gameOver = true;
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    background.draw();
    
    // Update and draw pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].draw();
        if (pipes[i].update()) {
            pipes.splice(i, 1);
            i--;
        }
    }
    
    // Draw foreground
    foreground.draw();
    
    // Update and draw bird
    bird.update();
    bird.draw();
    
    // Spawn new pipes
    if (gameStarted && frames % pipeInterval === 0) {
        pipes.push(new Pipe());
    }
    
    frames++;
    
    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling when pressing space
        if (!gameStarted || gameOver) {
            startGame(); // Start/restart the game if not started or game is over
        } else {
            bird.flap(); // Otherwise just flap the bird
        }
    }
});

// Touch controls
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!gameStarted || gameOver) {
        startGame(); // Start/restart the game if not started or game is over
    }
    bird.flap();
});

// Mouse controls
canvas.addEventListener('click', function() {
    if (!gameStarted || gameOver) {
        startGame(); // Start/restart the game if not started or game is over
    }
    bird.flap();
});

// Initial draw
background.draw();
foreground.draw();
bird.draw(); 