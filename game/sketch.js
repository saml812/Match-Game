let handPose;
let video;
let hands = [];

const options = {
    maxHands: 1,
    flipped: true,
    runtime: "tfjs",
    modelType: "full",
}

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  initializeCards();
}

let a = null;
let b = null;
let counter = 0;
let allowClick = true;

function draw() {
  image(video, 0, 0, width, height);

  for (let card of cards) {
    card.show();
  }

  if (hands.length > 0 && allowClick) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;

    fill(0, 255, 0);
    noStroke();
    circle(finger.x, finger.y, 10);
    circle(thumb.x, thumb.y, 10);

    for (let card of cards) {
      if (card.isHovered(finger)) {
        let length = dist(finger.x, finger.y, thumb.x, thumb.y);

        if (card.isFlipped || card.isMatched) {
          console.log("cannot click");
        } else {
          console.log("clickable");
          if (length < 20 && !card.isFlipped && !card.isMatched) {
            flipCard(card);
            counter += 1;

            if (counter == 1) {
              a = card;
            } else if (counter == 2) {
              b = card;
              allowClick = false;  // Disable clicking

              setTimeout(() => {
                if (compare(a, b)) {
                  console.log("matched");
                  a.isMatched = true;
                  b.isMatched = true;
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
}

function gotHands(results) {
  hands = results;
}

class Card {
  constructor(pos, key, size = [75, 75]) {
    this.key = key;
    this.pos = pos;
    this.size = size;
    this.isFlipped = false;
    this.isMatched = false;
  }

  show() {
    let x = this.pos[0];
    let y = this.pos[1];
    let w = this.size[0];
    let h = this.size[1];

    if (this.isMatched) {
      fill(0, 255, 0);
    } else if (this.isFlipped) {
      fill(255, 0, 0);
    } else {
      fill(0, 0, 255);
    }
    rect(x, y, w, h);

    if (this.isFlipped || this.isMatched) {
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text(this.key, x + w / 2, y + h / 2);
    }
  }

  isHovered(finger) {
    let x = this.pos[0];
    let y = this.pos[1];
    let w = this.size[0];
    let h = this.size[1];
    return finger.x > x && finger.x < x + w && finger.y > y && finger.y < y + h;
  }
}

let cards = [];

function initializeCards() {
  let keys = ["A", "B", "C", "D", "A", "B", "C", "D"];
  keys = shuffle(keys);

  let index = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      let pos = [j * 100 + 25, i * 100 + 25];
      cards.push(new Card(pos, keys[index]));
      index++;
    }
  }
}

function flipCard(card) {
  card.isFlipped = !card.isFlipped;
}

function compare(a, b) {
  return a.key == b.key;
}
