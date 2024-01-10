// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/iSq7acOT3/";
const resultContainer = document.getElementById("result");
const startButton = document.getElementById("start-button");

let intervalId; // To keep track of the timer interval
const timerElement = document.getElementById("timer"); // Assuming you have a timer element with id="timer"

function startTimer() {
  let seconds = 0;
  timerElement.textContent = "00:00";
  intervalId = setInterval(() => {
    seconds++;
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timerElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
  startButton.innerHTML = "Start Recording";
  startButton.style.display = "block";
}

startButton.addEventListener("click", () => {
  startButton.innerHTML = "Recording...";
  startTimer();
  init();
});
const classes = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  "Background Noise": "background-noise",
};
async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // get class labels
  const labelContainer = document.getElementById("label-container");
  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

 

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(
    (result) => {
      const scores = result.scores; // probability of prediction for each class
      const maxScore = Math.max(...scores);
      let maxIndex = scores.indexOf(maxScore);
      const predictedClass = classLabels[maxIndex];
  
      // Clear previous classes and set the new one based on the prediction
      resultContainer.className = '';
      resultContainer.classList.add(scores[maxIndex] === maxScore ? 'alert-light' : 'alert-primary');
      resultContainer.textContent = `Predicted class: ${predictedClass} (${maxScore.toFixed(2)})`;
  
      // Update the display for each class score
      for (let i = 0; i < classLabels.length; i++) {
        const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
        let currentNode = labelContainer.childNodes[i];
        currentNode.textContent = classPrediction;
  
        // Set the Bootstrap alert classes based on whether the score is the max score
        currentNode.className = ''; // Reset classes
        if (scores[i] === maxScore) {
          currentNode.classList.add('alert', 'alert-success'); // Add Bootstrap success alert class for the highest score
        } else {
          currentNode.classList.add('alert', 'alert-dark'); // Add Bootstrap primary alert class for other scores
        }
      }
      stopTimer();
      startButton.style.display = "none";
    },
    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );

  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}
