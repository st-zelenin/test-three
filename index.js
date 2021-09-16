import { run } from './test';

async function init() {
  const stream = await getMedia();
  const video = document.querySelector('#v');
  video.srcObject = stream;
  video.play();

  video.onloadeddata = () => {
    run(video);
  }
}

async function getMedia() {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
}

init();
