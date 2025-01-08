// Declare variables for veggie images and veggie list
let veggieImages = {};                                      // An Object to store whole and sliced images
let sounds = {};                                            // Storing the audios
let woodBackground;                                         // A Variable for the wood-textured background
let meatImage;                                              // A Variable for meat image
let veggies = [
  "bell pepper", "broccoli", "carrot", "chilli", "corn", "eggplant",
  "green bean", "mushroom", "potato", "pumpkin", "shallot", "tomato", "zucchini"
];
let game;                                                   // Main game object

// Trail variables: Taken help from Bassima in almost everything regards with trail
let trail = [];                                             // An Array to store trail positions
let trailDuration = 250;                                    // Duration in milliseconds for trail to persist
let trailThickness = 10;                                    // The Thickness of the trail
let trailColor = [10, 0, 0, 30];                            // A Greyish Black color

function preload() {
  // Load both whole and sliced versions for each veggie
  for (let veggie of veggies) {
    veggieImages[veggie] = {
      whole: loadImage(`Images/${veggie}.png`),                   // Whole veggie image
      sliced: loadImage(`Images/haft ${veggie}.png`)              // Sliced veggie image
    };
  }
  woodBackground = loadImage("Images/Wood background.png");       // Loading the wood-textured background
  meatImage = loadImage("Images/Meat.png");                       // Loading the meat image

  // Load sounds: Taken help from Garrit in the "loading the sound"
  soundFormats("mp3");
  sounds.start = loadSound("Audio/sounds_start.mp3");
  sounds.splatter = loadSound("Audio/sounds_splatter.mp3");
  sounds.missed = loadSound("Audio/sounds_missed.mp3");
  sounds.over = loadSound("Audio/sounds_over.mp3");
}

function setup() {
    createCanvas(windowWidth, windowHeight);                      // Adjusting canvas to full window size
    game = new VeggieWarrior();
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

    stroke(trailColor[0], trailColor[1], trailColor[2], alpha);     // Applying color with fade
    strokeWeight(trailThickness);
    line(prev.x, prev.y, curr.x, curr.y);                           // Drawing the trail segment
  }
  
  // Reset stroke and fill after drawing trail
  noStroke();
  fill(0);
}

function draw() {
  
  // Draw the trail
  drawTrail();
  image(woodBackground, 0, 0, width, height);

  game.update();
  game.display();
}

// Main Game Class
class VeggieWarrior {
  constructor() {
    this.state = "start";                                           // States like start, game, howToPlay, end
    this.veggies = [];
    this.maxVeggies = 1;
    this.veggieSpawnTimer = 0;
    this.lives = 3;
    this.score = 0;
    this.comboCount = 0; 
    this.highestCombo = 0; 
    this.comboTimer = 0;

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
    this.spawnVeggie();                                             // Spawning initial veggie
  }

  createButton(label, x, y, callback) {
    let btn = createButton(label);
    btn.position(x, y);
    btn.mousePressed(callback);
    btn.class("p5button");                                          // Adding a custom class for CSS
    btn.hide();
    return btn;
  }

  startGame() {
    this.state = "game";
    this.playButton.hide();
    this.howToPlayButton.hide();
    sounds.start.stop();
  }

  restartGame() {
    sounds.over.stop();                                             // Stopping the game-over sound when restarting
    this.state = "start";
    this.lives = 3;
    this.score = 0;
    this.veggies = [];
    this.maxVeggies = 1;
    this.veggieSpawnTimer = 0;
    this.restartButton.hide();
  }

  spawnVeggie() {
    // Choosing meat to spawn randomly
    let isMeat = random(1) < 0.1;                                   // Setting the spawning rate at 10%
    if (isMeat) {
      this.veggies.push(new Meat(random(width), height - 20, random(50, 70)));              // Spawning meat
    } else {
    // Choose a random veggie type and spawn it
      let type = random(veggies);
      this.veggies.push(new Vegetable(random(width), height - 20, random(60, 100), type));
    }
  }

  update() {
    if (this.state === "game") {
      this.updateGameScreen();
    }
  }

  updateGameScreen() {
    if (sounds.start.isPlaying()) {
      sounds.start.stop();                                          // Stopping the start screen sound when the game starts
  }
    // Update and display veggies
    for (let i = this.veggies.length - 1; i >= 0; i--) {
      let obj = this.veggies[i];
      obj.update();

      if (obj.isOffScreen()) {
        this.veggies.splice(i, 1);
        if (obj instanceof Vegetable && obj.state === "whole") {
          this.lives--;                                             // Reducning the life only for unsliced veggies.
          sounds.missed.play();                                     // Play missed sound for veggies
          this.comboCount = 0;                                      // Reset combo count on miss
        }
      }
            
      if (millis() - this.comboTimer > 1000) {                      // 1 second duration for combo
        this.comboCount = 0;                                        // Reset combo count if time exceeds
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
    if (!sounds.start.isPlaying()) {
      sounds.start.loop();                                            // Looping the start screen sound
    }
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
    if (!sounds.start.isPlaying()) {
      sounds.start.loop();                                            // Looping the start screen sound
    }
    image(woodBackground, 0, 0, width, height);
    textFont(this.font);
    textSize(20);
    textAlign(CENTER, CENTER);
    fill(255);
    text(
      "HOW TO PLAY:\n\nDrag the mouse over veggies to slice them! Keep an eye out on the MEAT. Make sure you don't slice it.\nDon't let veggies fall off the screen. Lose 3 lives and it's game over!",
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
    drawTrail();

    textFont(this.font);
    textSize(20);
    fill(0);
    text(`Score: ${this.score}`, 50, 20);
    text(`Lives: ${this.lives}`, width - 100, 20);
    text(`Combo: ${this.comboCount}`, 50, 50);
    text(`Highest Combo: ${this.highestCombo}`, 86, 80); 



    // Display veggies
    for (let veg of this.veggies) {
      veg.display();
    }
  }

  displayEndScreen() {
    if (!sounds.over.isPlaying()) {
    sounds.over.loop();                                                 // Looping the game-over sound
    }
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

window.onresize = () => {
    resizeCanvas(windowWidth, windowHeight);
    // Repositioning buttons on resize
    game.playButton.position(windowWidth / 2 - 80, windowHeight / 2);
    game.howToPlayButton.position(windowWidth / 2 - 80, windowHeight / 2 + 50);
    game.restartButton.position(windowWidth / 2 - 60, windowHeight / 2 + 50);
  };
  
// Meat Class
class Meat {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = random(-2, 2);
    this.vy = random(-10, -6);
    this.state = "whole";                                               // As the state can be "whole" or "sliced"
    this.halves = [];                                                   // This will hold the two halves if sliced
  }

  update() {
    if (this.state === "whole") {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;                                                   // Gravity effect

      if (this.x <= 0 || this.x >= width) this.vx *= -1;
      if (this.y <= 0) {
        this.vy *= -1;
        this.y = 0;
      }
    } else if (this.state === "sliced") {
      for (let half of this.halves) {
        half.x += half.vx;
        half.y += half.vy;
        half.vy += 0.2;                                                 // Gravity
      }
    }
  }

  display() {
    if (this.state === "whole") {
      image(meatImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else if (this.state === "sliced") {
      for (let half of this.halves) {
        image(meatImage, half.x - this.size / 4, half.y - this.size / 4, this.size / 2, this.size / 2);
      }
    }
  }

  slice() {
    if (this.state === "whole") {
      this.state = "sliced";
      this.halves = [
        { x: this.x - this.size / 4, y: this.y, vx: random(-2, -1), vy: random(-6, -4) },
        { x: this.x + this.size / 4, y: this.y, vx: random(1, 2), vy: random(-6, -4) }
      ];
      game.state = "end";                                               // Ending the game immediately
    }
  }

  isOffScreen() {
    if (this.state === "whole") {
      return this.y - this.size / 2 > height;
    } else {
      return this.halves.every(half => half.y - this.size / 2 > height);
    }
  }

  isHovered(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

// Vegetable Class
class Vegetable {
  constructor(x, y, size, veggieType) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = random(-2, 2);
    this.vy = random(-10, -6);                                          // Upward velocity
    this.type = veggieType;                                             // Type of veggie (e.g., "carrot")
    this.state = "whole";                                               // Can be "whole" or "halves"
    this.halves = [];                                                   // Holds the two halves if sliced
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
        half.vy += 0.2;                                                 // Gravity
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
      // Play splattering sound when a veggie is sliced
      sounds.splatter.play();
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
      let obj = game.veggies[i];                                              // Generic object (can be vegetable or meat)
      if (obj.state === "whole") {
        let d = dist(mouseX, mouseY, obj.x, obj.y);
        if (d < obj.size / 2) {
          obj.slice();                                                        // Calling the slice method for the object
          if (obj instanceof Vegetable) {
            // Increase score only for vegetables
            let points = 2;                                                   // Base points for slicing
            if (game.comboCount > 1) {
              points *= 2;                                                    // Double points if in combo
            }
            game.score += points;                                             // Add points to score
            game.comboCount++;                                                // Increment combo count
            game.comboTimer = millis();                                       // Reset combo timer
            game.highestCombo = max(game.highestCombo, game.comboCount);      // Update highest combo
          }
          break;                                                              // Exiting the loop once an object is sliced
        }
      }
    }
  }
}
