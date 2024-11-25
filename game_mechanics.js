function setup() {
    createCanvas(800, 600);
  }
  
  function draw() {
    background(255, 140, 0);
    game.update();
    game.display();
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
  