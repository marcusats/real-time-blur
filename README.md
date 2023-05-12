# Real-time Face Masking in P2P WebRTC App

This project is a web application that uses Next.js, MediaPipe, and a Node.js server to implement real-time blur functionalities during video calls.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Functionality](#functionality)
- [Contribution](#contribution)

## Getting Started

### Prerequisites

Before you start, ensure you have installed Node.js and npm (Node Package Manager) on your system. If not, you can download and install them from [here](https://nodejs.org/).

### Installation

Clone this repository to your local machine:

\`\`\`bash
git clone https://github.com/marcusats/real-time-blur.git
\`\`\`

Navigate to the project directory:

\`\`\`bash
cd real-time-blur
\`\`\`

Install the required dependencies:

\`\`\`bash
npm i --legacy-peer-deps
\`\`\`

### Running the Program

You will need two terminal windows or tabs to run the client and server concurrently.

#### Running the Server

In the first terminal, run the following command to start the server:

\`\`\`bash
npm run serve
\`\`\`

#### Running the Client

In the second terminal, navigate to the project directory (if not already there) and run the following command to start the client:

\`\`\`bash
npm run dev
\`\`\`

Now, you should be able to access the application at `http://localhost:3000` (or the port number specified in your setup) in your web browser. You can access a simple blur demo by clicking on "Enter Blur Face Demo" on the home page.

## Project Overview

This project utilizes MediaPipe's face recognition technology to detect the user's face and applies a blurring effect in real time during video calls. This feature is particularly useful for maintaining anonymity during video communication.

The project primarily uses Next.js for the front-end client, a Node.js server for signaling in WebRTC, and MediaPipe for face detection and application of blur effect.

## Functionality

The core functionality of this project lies in three main functions: `boxBlur()`, `blurFace()`, and `convertFaceLandmarksToFaceRegion()`. You can find these functions in the [blur.js](src/lib/ImageManipualtion/maskFace.js) file.

- `boxBlur(imageData, radius)`: This function takes an ImageData object and a radius as input. It calculates and assigns average color values, resulting in a blur effect. [More details here](src/lib/ImageManipualtion/maskFace.js#1).

- `blurFace(frame, faceRegion, boxBlur)`: This function retrieves specific image data, applies the `boxBlur()` function, and overlays the blurred face onto the original frame. [More details here](src/lib/ImageManipualtion/maskFace.js#36).

- `convertFaceLandmarksToFaceRegion(faceLandmarks, frame)`: This function converts face landmarks data provided by MediaPipe's FaceMesh model into a face region. [More details here](src/lib/ImageManipualtion/maskFace.js#51).

