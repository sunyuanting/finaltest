let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let grabbedCircle = null; // 用於追蹤抓取的圓圈
let holding = false;
let handX = 0;
let handY = 0;
let message = ""; // 用於顯示答對或錯誤的訊息
let circle1990 = { x: 100, y: 240 };
let circle2000 = { x: 540, y: 240 };

const GRAB_DISTANCE = 40;
const RELEASE_DISTANCE = 60;
const indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const indices2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
const leftEyeIndices = [243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112];
const rightEyeIndices = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
const foreheadIndices = [151, 109, 69, 66, 55, 8, 285, 296, 299, 338];

// 🌧 水珠效果
let raindrops = [];
let mouthOpen = false;
const MOUTH_TOP = 13;  // 上唇中間
const MOUTH_BOTTOM = 14;  // 下唇中間

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  push();
  scale(-1, 1);
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text("淡江教育學院是哪一年成立的?", -width / 2, 10);
  pop();

  drawCircle(circle1990, "1990年");
  drawCircle(circle2000, "2000年");

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    drawFace(keypoints);

    // 嘴巴開口偵測
    const [xTop, yTop] = keypoints[MOUTH_TOP];
    const [xBot, yBot] = keypoints[MOUTH_BOTTOM];
    const mouthDist = dist(xTop, yTop, xBot, yBot);
    mouthOpen = mouthDist > 5;  // 可以微調這個閾值

    // 🌧 嘴巴張開才開始產生水滴
    if (mouthOpen) {
      if (frameCount % 5 === 0) {
        raindrops.push({
          x: random(width),
          y: 0,
          speed: random(3, 7)
        });
      }
    } else {
      raindrops = []; // 嘴巴閉上清除水珠
    }
  }

  // 🌧 畫水珠
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let drop = raindrops[i];
    fill(0, 100, 255, 180);
    noStroke();
    ellipse(drop.x, drop.y, 10, 10);
    drop.y += drop.speed;
    if (drop.y > height) {
      raindrops.splice(i, 1);
    }
  }

  if (handPredictions.length > 0) {
    const keypoints = handPredictions[0].landmarks;
    const [ix, iy] = keypoints[8];
    const [tx, ty] = keypoints[4];
    handX = ix;
    handY = iy;

    let pinchDist = dist(ix, iy, tx, ty);

    if (!holding && pinchDist < GRAB_DISTANCE) {
      if (dist(ix, iy, circle1990.x, circle1990.y) < 50) {
        grabbedCircle = "1990";
        holding = true;
      } else if (dist(ix, iy, circle2000.x, circle2000.y) < 50) {
        grabbedCircle = "2000";
        holding = true;
      }
    }

    if (holding && pinchDist > RELEASE_DISTANCE) {
      holding = false;
      grabbedCircle = null;
    }

    for (let i = 0; i < keypoints.length; i++) {
      const [x, y] = keypoints[i];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }

  if (holding) {
    if (grabbedCircle === "1990") {
      circle1990.x = handX;
      circle1990.y = handY;
    } else if (grabbedCircle === "2000") {
      circle2000.x = handX;
      circle2000.y = handY;
    }
  }

  // 根據當前抓取狀態更新訊息
if (holding && grabbedCircle === "2000") {
  message = "答對";
} else if (holding && grabbedCircle === "1990") {
  message = "錯誤";
} else {
  message = "請抓取圓圈";
}

  push();
  scale(-1, 1);
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text(message, -width / 2, height - 50);
  pop();
}

function drawCircle(circle, label) {
  push();
  fill(255);
  stroke(0);
  strokeWeight(2);
  ellipse(circle.x, circle.y, 100, 100);
  scale(-1, 1);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(label, -circle.x, circle.y);
  pop();
}

function drawFace(keypoints) {
  // 繪製臉部的各種形狀（保持原有邏輯）
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  endShape();

  stroke(255, 0, 0);
  strokeWeight(2);
  fill(255, 255, 0, 200);
  beginShape();
  for (let i = 0; i < indices2.length; i++) {
    const idx = indices2[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  endShape(CLOSE);

  fill(0, 255, 0, 150);
  noStroke();
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  for (let i = indices2.length - 1; i >= 0; i--) {
    const idx = indices2[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  endShape(CLOSE);

  fill(128, 0, 128, 150);
  noStroke();
  beginShape();
  for (let i = 0; i < leftEyeIndices.length; i++) {
    const idx = leftEyeIndices[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  endShape(CLOSE);

  stroke(128, 0, 128);
  strokeWeight(2);
  for (let i = 0; i < leftEyeIndices.length - 1; i++) {
    const idx1 = leftEyeIndices[i];
    const idx2 = leftEyeIndices[i + 1];
    const [x1, y1] = keypoints[idx1];
    const [x2, y2] = keypoints[idx2];
    line(x1, y1, x2, y2);
  }
  const [xStart, yStart] = keypoints[leftEyeIndices[0]];
  const [xEnd, yEnd] = keypoints[leftEyeIndices[leftEyeIndices.length - 1]];
  line(xStart, yStart, xEnd, yEnd);

  stroke(0, 0, 255);
  strokeWeight(10);
  for (let i = 0; i < rightEyeIndices.length - 1; i++) {
    const idx1 = rightEyeIndices[i];
    const idx2 = rightEyeIndices[i + 1];
    const [x1, y1] = keypoints[idx1];
    const [x2, y2] = keypoints[idx2];
    line(x1, y1, x2, y2);
  }
  const [xStartRight, yStartRight] = keypoints[rightEyeIndices[0]];
  const [xEndRight, yEndRight] = keypoints[rightEyeIndices[rightEyeIndices.length - 1]];
  line(xStartRight, yStartRight, xEndRight, yEndRight);

  fill(255, 182, 193, 150);
  noStroke();
  beginShape();
  for (let i = 0; i < foreheadIndices.length; i++) {
    const idx = foreheadIndices[i];
    const [x, y] = keypoints[idx];
    vertex(x, y);
  }
  endShape(CLOSE);

  stroke(255, 0, 0);
  strokeWeight(10);
  for (let i = 0; i < foreheadIndices.length - 1; i++) {
    const idx1 = foreheadIndices[i];
    const idx2 = foreheadIndices[i + 1];
    const [x1, y1] = keypoints[idx1];
    const [x2, y2] = keypoints[idx2];
    line(x1, y1, x2, y2);
  }
  const [xStartForehead, yStartForehead] = keypoints[foreheadIndices[0]];
  const [xEndForehead, yEndForehead] = keypoints[foreheadIndices[foreheadIndices.length - 1]];
  line(xStartForehead, yStartForehead, xEndForehead, yEndForehead);
}
