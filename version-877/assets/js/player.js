(function() {
  window.initMoviePlayer = function(options) {
    var video = document.getElementById(options.videoId);
    var trigger = document.getElementById(options.triggerId);
    var layer = document.getElementById(options.layerId);
    var url = options.url;
    if (!video || !url) {
      return;
    }

    var hlsInstance = null;

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = url;
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add('hidden');
      }
    }

    function play() {
      attachOnce();
      hideLayer();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function() {});
      }
    }

    var attached = false;
    function attachOnce() {
      if (!attached) {
        attached = true;
        attach();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (layer) {
      layer.addEventListener('click', play);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideLayer);
    video.addEventListener('loadedmetadata', hideLayer);
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
}());
