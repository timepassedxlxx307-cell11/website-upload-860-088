(function () {
  var video = document.getElementById("movie-player");
  var layer = document.getElementById("play-layer");
  var button = document.getElementById("play-button");
  var configNode = document.getElementById("player-config");

  if (!video || !configNode) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configNode.textContent || "{}");
  } catch (error) {
    config = {};
  }

  var url = config.url || "";
  var started = false;
  var hls = null;

  function loadVideo() {
    if (!url || started) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    started = true;
  }

  function startPlayback() {
    loadVideo();

    if (layer) {
      layer.classList.add("is-hidden");
      layer.setAttribute("aria-hidden", "true");
    }

    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (layer) {
    layer.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!started) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
