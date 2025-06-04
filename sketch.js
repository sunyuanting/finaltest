let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];

const indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const indices2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
const leftEyeIndices = [243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112];
const rightEyeIndices = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
const foreheadIndices = [151, 109, 69, 66, 55, 8, 285, 296, 299, 338];

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
  // 翻轉畫布
  translate(width, 0); // 將原點移到右側
  scale(-1, 1); // 左右翻轉

  image(video, 0, 0, width, height);

  // 在影像上方顯示文字
  push();
  scale(-1, 1); // 翻轉文字回正
  fill(0); // 設定文字顏色為黑色
  textSize(24); // 設定文字大小
  textAlign(CENTER, TOP); // 文字置中對齊
  text("淡江教育學院是哪一年成立的?", -width / 2, 10); // 顯示文字
  pop();

  // 在影像左側畫圓圈並顯示 "1990年"
  push();
  fill(255, 255, 255); // 圓圈填充顏色為白色
  stroke(0); // 圓圈邊框顏色為黑色
  strokeWeight(2); // 邊框粗細
  ellipse(100, height / 2, 100, 100); // 畫圓圈
  fill(0); // 設定文字顏色為黑色
  textSize(16); // 設定文字大小
  textAlign(CENTER, CENTER); // 文字置中對齊
  text("1990年", 100, height / 2); // 顯示文字
  pop();

  // 在影像右側畫圓圈並顯示 "2000年"
  push();
  fill(255, 255, 255); // 圓圈填充顏色為白色
  stroke(0); // 圓圈邊框顏色為黑色
  strokeWeight(2); // 邊框粗細
  ellipse(width - 100, height / 2, 100, 100); // 畫圓圈
  fill(0); // 設定文字顏色為黑色
  textSize(16); // 設定文字大小
  textAlign(CENTER, CENTER); // 文字置中對齊
  text("2000年", width - 100, height / 2); // 顯示文字
  pop();

  // 繪製臉部偵測
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 繪製臉部的各種形狀（保持原有邏輯）
    drawFace(keypoints);
  }

  // 繪製手部偵測
  if (handPredictions.length > 0) {
    for (let i = 0; i < handPredictions.length; i++) {
      const hand = handPredictions[i];
      const keypoints = hand.landmarks;

      // 繪製手部關鍵點
      for (let j = 0; j < keypoints.length; j++) {
        const [x, y] = keypoints[j];
        fill(0, 255, 0);
        noStroke();
        ellipse(x, y, 10, 10); // 用綠色圓點表示手部關鍵點
      }

      // 繪製手指骨架
      stroke(255, 0, 0);
      strokeWeight(2);
      const annotations = hand.annotations;
      for (const part in annotations) {
        const points = annotations[part];
        for (let k = 0; k < points.length - 1; k++) {
          const [x1, y1] = points[k];
          const [x2, y2] = points[k + 1];
          line(x1, y1, x2, y2); // 用紅色線條連接手指骨架
        }
      }
    }
  }
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
