let handPose;
let video;
let hands = [];

const options = {
    maxHands: 1,
    flipped: true,
    runtime: "tfjs",
    modelType: "full",
    detectorModelUrl: undefined, //default to use the tf.hub model
    landmarkModelUrl: undefined, //default to use the tf.hub model
}

function preload() {
  // Load the handPose model
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO, {flipped:true});
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  //Highlight landmark 4 and 8
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;

    fill(0, 255, 0);
    noStroke();
    circle(finger.x, finger.y, 10);
    circle(thumb.x, thumb.y, 10);
    
    if ( (finger.x > 150) && (finger.x < 250) && (finger.y > 150) && (finger.y < 350) ) {
      let length = dist(finger.x, finger.y, thumb.x, thumb.y);
      stroke('magenta');
      strokeWeight(5)
      line(finger.x, thumb.x, finger.y, thumb.y)

      // if (length <= 15) {
        
      // }
    }

  }
  fill(0, 0, 255, 127);
  rect(100, 100, 100, 150);
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

// Class Object: Cards
// Global functions

class Card {
  constructor(key, pos, size=[100,100]) {
      this.key = key;
      this.pos = pos
      this.size = size
      this.text = "";
      this.color = (255,0,0);
      this.isFlipped = true;
      this.isMatched = false;
  }

  //getter
  get isFlipped(){
    return this.isFlipped;
  }

  get isMatched(){
    return this.isMatched;
  }

  get key(){
    return this.key;
  }

  //setter
  set isFlipped(bool){
    this.isFlipped = bool;
  }

  set text(string){
    this.text = string;
  }

  set color(color){
    this.color = color;
  }

  set isMatched(bool){
    this.isMatched = bool;
  }
}

function flipCard(Card){
  if (Card.flipState){
    Card.flipState(false);
    Card.text("");
    Card.color("blue");
  } else {
    Card.flipState(true);
    Card.text(Card.key);
    Card.color("red");
  }
}

function compare(Card1, Card2){
  return Card1.key == Card2.key;
}

function match(Card1, Card2){
  if (compare(Card1, Card2)){
    Card1.isMatched(true);
    Card2.isMatched(true);
    Card1.color("green");
    Card2.color("green");
    return true;
  }
  else {
    return false;
  }
}



