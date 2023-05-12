function boxBlur(imageData, radius) {
  const { data, width, height } = imageData;
  let output = new ImageData(width, height);
  let i, j, x, y;

  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      
      for (y = -radius; y <= radius; y++) {
        for (x = -radius; x <= radius; x++) {
          let posX = Math.min(width - 1, Math.max(0, j + x));
          let posY = Math.min(height - 1, Math.max(0, i + y));

          let index = (posY * width + posX) * 4;
          sumR += data[index];
          sumG += data[index + 1];
          sumB += data[index + 2];
          count++;
        }
      }

      let index = (i * width + j) * 4;
      output.data[index] = sumR / count;
      output.data[index + 1] = sumG / count;
      output.data[index + 2] = sumB / count;
      output.data[index + 3] = 255; 
    }
  }

  return output;
}


function blurFace(frame, faceRegion, boxBlur) {
  const { minX, minY, width, height } = faceRegion;

  // Get the image data of the face
  const faceImageData = frame.getImageData(minX, minY, width, height);

  // Blur the face image data
  const blurredFaceImageData = boxBlur(faceImageData, 10);

  // Draw the blurred face back onto the frame
  frame.putImageData(blurredFaceImageData, minX, minY);

  return frame;
}

function convertFaceLandmarksToFaceRegion(faceLandmarks, frame) {
  let minX = frame.width, minY = frame.height, maxX = 0, maxY = 0;
  for (const landmark of faceLandmarks) {
    minX = Math.min(minX, landmark.x * frame.width);
    minY = Math.min(minY, landmark.y * frame.height);
    maxX = Math.max(maxX, landmark.x * frame.width);
    maxY = Math.max(maxY, landmark.y * frame.height);
  }

  return {
    minX: Math.floor(minX),
    minY: Math.floor(minY),
    width: Math.ceil(maxX - minX),
    height: Math.ceil(maxY - minY)
  };
}


export {
  boxBlur,
  blurFace,
  convertFaceLandmarksToFaceRegion
}

  