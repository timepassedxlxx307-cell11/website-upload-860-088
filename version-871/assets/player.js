(function () {
  function bind(playerId, sourceUrl) {
    var shell = document.getElementById(playerId);
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var state = shell.querySelector('.player-state');
    var started = false;
    var hls = null;

    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function start() {
      if (!video || started) {
        if (video) {
          video.play().catch(function () {});
        }
        return;
      }

      started = true;
      hideCover();
      setState('正在加载...');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('');
          video.play().catch(function () {
            setState('点击画面继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setState('视频加载失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', function () {
          setState('');
          video.play().catch(function () {
            setState('点击画面继续播放');
          });
        }, { once: true });
        video.addEventListener('error', function () {
          setState('视频加载失败');
        }, { once: true });
      } else {
        setState('视频加载失败');
      }
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('video')) {
        if (!started) {
          start();
        }
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        hideCover();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    bind: bind
  };
}());
