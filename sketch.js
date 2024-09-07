let handsModel;
let video;
let cards = [];
let a = null;
let b = null;
let counter = 0;
let allowClick = true;
let score = 0;
let gameOver = false;
let finger = null;
let thumb = null;

const canvasWidth = 800;
const canvasHeight = 600;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(canvasWidth, canvasHeight);
  video.hide();
  initializeCards();
  textAlign(CENTER, CENTER);
  
  // Set up Mediapipe Hands
  handsModel = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});
  
  handsModel.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  handsModel.onResults(onResults);

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await handsModel.send({ image: video.elt });
    },
    width: canvasWidth,
    height: canvasHeight
  });
  camera.start();
}

function draw() {
  image(video, 0, 0, width, height);

  // if (gameOver) {
  //   displayVictory();
  //   return;
  // }

  for (let card of cards) {
    card.show();
  }

  fill(255);
  textSize(50);
  text(`Score: ${score}`, 100, canvasHeight - 20);

  if (finger && thumb && allowClick) {
    fill(0, 255, 0);
    noStroke();
    circle(finger.x, finger.y, 10);
    circle(thumb.x, thumb.y, 10);

    for (let card of cards) {
      if (card.isHovered(finger) && !card.isMatched) {
        card.highlight();
        let length = dist(finger.x, finger.y, thumb.x, thumb.y);

        if (card.isFlipped || card.isMatched) {
          console.log("cannot click");
        } else {
          console.log("clickable");
        }
        
        if (!card.isFlipped && !card.isMatched && length < 20) {
          flipCard(card);
          counter += 1;

          if (counter == 1) {
            a = card;
          } else if (counter == 2) {
            b = card;
            allowClick = false;

            setTimeout(() => {
              if (compare(a, b)) {
                console.log("matched");
                a.isMatched = true;
                b.isMatched = true;
                score++;
                //checkVictory();
              } else {
                console.log("no match!");
                flipCard(a);
                flipCard(b);
              }
              counter = 0;
              allowClick = true;
            }, 1000);  // 1 second delay
          }
        }
      }
    }
  }
}

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    finger = { x: width - landmarks[8].x * width, y: landmarks[8].y * height };  // Index finger tip
    thumb = { x: width - landmarks[4].x * width, y: landmarks[4].y * height };  // Thumb tip
  } else {
    finger = null;
    thumb = null;
  }
}

class Card {
  constructor(pos, size, color) {
    this.color = color;
    this.pos = pos;
    this.size = size;
    this.isFlipped = false;
    this.isMatched = false;
  }

  show() {
    if (this.isMatched) {
      fill(0,0,0,0);
    } else if (this.isFlipped) {
      fill(this.color);
    } else {
      fill("white");
    }
    rect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
  }

  isHovered(finger) {
    return finger.x > this.pos[0] && finger.x < this.pos[0] + this.size[0] && finger.y > this.pos[1] && finger.y < this.pos[1] + this.size[1];
  }

  highlight() {
    stroke(255, 255, 0);
    strokeWeight(4);
    noFill();
    rect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
    noStroke();
  }
}

function initializeCards() {
  let colors = ["green", "blue", "red", "purple", "green", "blue", "red", "purple"];
  colors = shuffle(colors);

  let rows = 2;
  let cols = 4;
  let cardWidth = 100;
  let cardHeight = 100;
  let gridWidth = cols * cardWidth + (cols - 1) * 25;
  let gridHeight = rows * cardHeight + (rows - 1) * 25;
  let x = (canvasWidth - gridWidth) / 2;
  let y = (canvasHeight - gridHeight) / 2;

  let index = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let pos = [x + j * (cardWidth + 25), y + i * (cardHeight + 25)];
      cards.push(new Card(pos, [cardWidth, cardHeight], colors[index]));
      index++;
    }
  }
}

function flipCard(card) {
  card.isFlipped = !card.isFlipped;
}

function compare(a, b) {
  return a.color == b.color;
}

// function checkVictory() {
//   if (score == cards.length / 2) {
//     gameOver = true;
//   }
// }

// function displayVictory() {
//   fill(0, 255, 0);
//   textSize(200);
//   text("You Win!", width / 2, height / 2);
//   noLoop();
// }
