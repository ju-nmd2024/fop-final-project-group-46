function setup() {
    createCanvas(800, 600);
  }
  
  function draw() {
    background(255, 140, 0);
    game.update();
    game.display();
  }

class VeggieWarrior {
    constructor() {
      this.state = "start";                   // start, game, howToPlay, end
      this.veggies = [];                      // Array to store vegetable objects
      this.maxVeggies = 1;                    // Number of veggies to spawn initially
      this.veggieSpawnTimer = 0;              // Timer for spawning veggies
      this.lives = 3;                         // Player starts with 3 lives
      this.score = 0;                         // Initial score

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
      this.spawnVeggie();               // Spawn the first veggie
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
      // Add a new vegetable object to the array
      this.veggies.push(new Vegetable(random(width), height - 20, random(30, 50)));
    }

    update() {
        if (this.state === "game") {
          // Update veggies' positions
          for (let i = this.veggies.length - 1; i >= 0; i--) {
            let veg = this.veggies[i];
            veg.update();
    
            // If a veggie falls off screen, reduce a life
            if (veg.isOffScreen()) {
              this.veggies.splice(i, 1);
              this.lives--;
            }
          }
    
          // Spawn new veggies based on timer
          this.veggieSpawnTimer++;
          if (this.veggieSpawnTimer > 100) {
            this.spawnVeggie();
            this.veggieSpawnTimer = 0;
          }
    
          // Check for game over
          if (this.lives <= 0) {
            this.state = "end";
          }
        }
      }

      display() {
        if (this.state === "start") {
            this.displayStartScreen();
        } else if (this.state === "game") {
            this.displayStartScreen();
        } else if (this.state === "end") {
            this.displayEndScreen();
        }
      }

      displayStartScreen() {
        background(120, 200, 100);
        textFont("Georgia");
        textSize(50);
        textAlign(CENTER, CENTER);
        fill(255);
        text("VEGGIE WARRIOR", width / 2, height / 3);
        textSize(20);
        text("Click to Play", width / 2, height / 2);
      }

      displayGameScreen() {
        background(200);
        textFont("Georgia");
        textSize(20);
        fill(0);
        // Displaying the score and the lives
        text(`Score: ${this.score}`, 10, 20);
        text(`Lives: ${this.lives}`, width - 100, 20);

        //Displaying the veggies
        for (let veg of this.veggies) {
            veg.display();
        }
      }

      displayEndScreen() {
        background(200, 50, 50);
        textFont("Georgia");
        textAlign(CENTER, CENTER);
        textSize(50);
        fill(255);
        text("GAME OVER", width / 2, height / 3);
        textSize(30);
        text(`Your final score is: ${this.score}`, width / 2, height / 2);
      }
}

// Vegetable Class
class Vegetable {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.vx = random(-2, 2);
      this.vy = random(-10, -6);
      this.color = color(random(50, 255), random(50, 255), random(50, 255));
    }
  
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;               // Gravity
    }
  
    display() {
      fill(this.color);
      ellipse(this.x, this.y, this.size);
    }
  
    isOffScreen() {
      return this.y > height;
    }
  }

// Handling the mouse dragging for slicing the veggies
function mouseDragged() {
    if (game.state === "game") {
        for(let i = game.veggies.length - 1; i >= 0; i--) {
            let veg = game.veggies[i];
            let d = dist (mouseX, mouseY, veg.x, veg.y);
            if (d < veg.size / 2) {
                game.veggies.splice(i, 1);                          // Removing sliced veggie
                game.score++;                                       // Increasing the score
                break;
            }
        }
    }
}
  