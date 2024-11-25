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
  
      // Spawn the first veggie
      this.spawnVeggie();
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
  