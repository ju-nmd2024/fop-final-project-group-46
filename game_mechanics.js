// Declare variables for veggie images and veggie list
let veggieImages = {};              // Object to store whole and sliced images
let woodBackground;                 // Variable for the wood-textured background
let veggies = [
  "bell pepper", "broccoli", "carrot", "chilli", "corn", "eggplant",
  "green bean", "mushroom", "potato", "pumpkin", "shallot", "tomato", "zucchini"
];
let game;                           // Main game object

// Trail variables
let trail = [];                                             // Array to store trail positions
let trailDuration = 250;                                    // Duration in milliseconds for trail to persist
let trailThickness = 5;                                     // Thickness of the trail
let trailColor = [10, 0, 0, 30];                            // Greyish Black color

function preload() {
  // Load both whole and sliced versions for each veggie
  for (let veggie of veggies) {
    veggieImages[veggie] = {
      whole: loadImage(`Images/${veggie}.png`),             // Whole veggie image
      sliced: loadImage(`Images/haft ${veggie}.png`)        // Sliced veggie image
    };
  }
  woodBackground = loadImage("Images/Wood background.png");       // Load the wood-textured background
}

function setup() {
  createCanvas(600, 400);
  game = new VeggieWarrior();
}

function draw() {
  background(200);

  // Draw the trail
  drawTrail();

  game.update();
  game.display();
}

// Function to draw the trail
function drawTrail() {
  // Add the current mouse position to the trail
  trail.push({
    x: mouseX,
    y: mouseY,
    timestamp: millis(),
  });

  // Remove old points from the trail
  trail = trail.filter(point => millis() - point.timestamp < trailDuration);

  // Draw the trail with fading effect
  noFill();
  for (let i = 1; i < trail.length; i++) {
    let curr = trail[i];
    let prev = trail[i - 1];

    // Calculate opacity based on time elapsed
    let age = millis() - curr.timestamp;
    let alpha = map(age, 0, trailDuration, 255, 0);

    stroke(trailColor[0], trailColor[1], trailColor[2], alpha); // Apply color with fade
    strokeWeight(trailThickness);
    line(prev.x, prev.y, curr.x, curr.y); // Draw the trail segment
  }
  
  // Reset stroke and fill after drawing trail
  noStroke();
  fill(0);
}

// Main Game Class
class VeggieWarrior {
  constructor() {
    this.state = "start"; // start, game, howToPlay, end
    this.veggies = [];
    this.maxVeggies = 1;
    this.veggieSpawnTimer = 0;
    this.lives = 3;
    this.score = 0;

    // Buttons
    this.playButton = this.createButton("Click to Play", width / 2 - 60, height / 2, () => {
      if (this.state === "start") {
        this.startGame();
      } else if (this.state === "howToPlay") {
        this.state = "start";
        this.playButton.html("Click to Play");
      }
    });

    this.howToPlayButton = this.createButton("How to Play", width / 2 - 60, height / 2 + 50, () => {
      this.state = "howToPlay";
      this.howToPlayButton.hide();

      this.playButton.html("Back");
    });

    this.restartButton = this.createButton("Restart", width / 2 - 40, height / 2 + 50, () => {
      this.restartGame();
    });
    this.restartButton.hide();

    this.font = "Georgia";  
    this.spawnVeggie(); // Spawn initial veggie
  }

  createButton(label, x, y, callback) {
    let btn = createButton(label);
    btn.position(x, y);
    btn.mousePressed(callback);
    btn.hide();
    return btn;
  }

  startGame() {
    this.state = "game";
    this.playButton.hide();
    this.howToPlayButton.hide();
  }

  restartGame() {
    this.state = "start";
    this.lives = 3;
    this.score = 0;
    this.veggies = [];
    this.maxVeggies = 1;
    this.veggieSpawnTimer = 0;
    this.restartButton.hide();
  }

  spawnVeggie() {
    // Choose a random veggie type and spawn it
    let type = random(veggies);
    this.veggies.push(new Vegetable(random(width), height - 20, random(30, 50), type));
  }

  update() {
    if (this.state === "game") {
      this.updateGameScreen();
    }
  }

  updateGameScreen() {
    // Update and display veggies
    for (let i = this.veggies.length - 1; i >= 0; i--) {
      let veg = this.veggies[i];
      veg.update();

      if (veg.isOffScreen()) {
        if (veg.state === "whole") {
          this.lives--; // Reduce life only for unsliced veggies.
        }
        this.veggies.splice(i, 1);
      }
    }

    // Spawn veggies progressively
    this.veggieSpawnTimer++;
    if (this.veggieSpawnTimer > 100 - this.score * 2 && this.veggies.length < this.maxVeggies) {
      this.spawnVeggie();
      this.veggieSpawnTimer = 0;
    }

    // Increase the number of veggies gradually
    if (this.score > 0 && this.score % 5 === 0 && this.maxVeggies < 10) {
      this.maxVeggies++;
    }
    
    // Check for game over
    if (this.lives <= 0) {
      this.state = "end";
    }
  }

  display() {
    if (this.state === "start") {
      this.displayStartScreen();
    } else if (this.state === "game") {
      this.displayGameScreen();
    } else if (this.state === "howToPlay") {
      this.displayHowToPlayScreen();
    } else if (this.state === "end") {
      this.displayEndScreen();
    }
  }

  displayStartScreen() {
    image(woodBackground, 0, 0, width, height);
    textFont(this.font);
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255);
    text("VEGGIE WARRIOR", width / 2, height / 3);

    // Show start screen buttons
    this.playButton.show();
    this.howToPlayButton.show();
  }

  displayHowToPlayScreen() {
    image(woodBackground, 0, 0, width, height);
    textFont(this.font);
    textSize(20);
    textAlign(CENTER, CENTER);
    fill(255);
    text(
      "HOW TO PLAY:\n\nDrag the mouse over veggies to slice them!\nDon't let veggies fall off the screen.\nLose 3 lives and it's game over!",
      width / 2,
      height / 2 - 50
    );
    text("Click the 'Back' button below to return to the start screen.", width / 2, height - 50);
  }

  displayGameScreen() {
    // Hide start screen buttons
    this.playButton.hide();
    this.howToPlayButton.hide();

    // Display score and lives
    image(woodBackground, 0, 0, width, height);
    textFont(this.font);
    textSize(20);
    fill(0);
    text(`Score: ${this.score}`, 50, 20);
    text(`Lives: ${this.lives}`, width - 100, 20);

    // Display veggies
    for (let veg of this.veggies) {
      veg.display();
    }
  }

  displayEndScreen() {
    image(woodBackground, 0, 0, width, height);
    textFont(this.font);
    textAlign(CENTER, CENTER);
    textSize(50);
    fill(255);
    text("GAME OVER", width / 2, height / 3);
    textSize(30);
    text(`Your final score is: ${this.score}`, width / 2, height / 2);

    // Show restart button
    this.restartButton.show();
  }
}

// Vegetable Class
class Vegetable {
  constructor(x, y, size, veggieType) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = random(-2, 2);
    this.vy = random(-10, -6);            // Upward velocity
    this.type = veggieType;                     // Type of veggie (e.g., "carrot")
    this.state = "whole";                 // Can be "whole" or "halves"
    this.halves = [];                     // Holds the two halves if sliced
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Apply gravity
    this.vy += 0.2;

    if (this.state === "halves") {
      for (let half of this.halves) {
        half.x += half.vx;
        half.y += half.vy;
        half.vy += 0.2; // Gravity
      }
    }

    // Constrain within canvas boundaries
    if (this.x <= 0 || this.x >= width) {
      this.vx *= -1;
    }
    if (this.y <= 0) {
      this.vy *= -1;
      this.y = 0;
    }
  }

  display() {
    if (this.state === "whole") {
      image(veggieImages[this.type].whole, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else if (this.state === "halves") {
      for (let half of this.halves) {
        image(veggieImages[this.type].sliced, half.x - this.size / 4, half.y - this.size / 4, this.size / 2, this.size / 2);
      }
    }
  }

  slice() {
    if (this.state === "whole") {
      this.state = "halves";
      this.halves = [
        {
          x: this.x - this.size / 4,
          y: this.y,
          size: this.size / 2,
          vx: random(-2, -1),
          vy: random(-5, -3),
          image: veggieImages[this.type].sliced
        },
        {
          x: this.x + this.size / 4,
          y: this.y,
          size: this.size / 2,
          vx: random(1, 2),
          vy: random(-5, -3),
          image: veggieImages[this.type].sliced
        }
      ];
    }
  }

  isOffScreen() {
    if (this.state === "halves") {
      return this.halves.every(half => half.y > height);
    }
    return this.y > height;
  }

  isHovered(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

// Handle mouse drag for slicing
function mouseDragged() {
  if (game.state === "game") {
    for (let i = game.veggies.length - 1; i >= 0; i--) {
      let veg = game.veggies[i];
      if (veg.state === "whole") {
        let d = dist(mouseX, mouseY, veg.x, veg.y);
        if (d < veg.size / 2) {
          veg.state = "halves";

          // Create two halves
          veg.halves = [
            { x: veg.x - 10, y: veg.y, vx: random(-2, -1), vy: random(-6, -4) },
            { x: veg.x + 10, y: veg.y, vx: random(1, 2), vy: random(-6, -4) }
          ];

          game.score++;
          break;
        }
      }
    }
  }
}