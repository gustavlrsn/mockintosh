export default function toggleFullscreen(event) {
  var element = document.documentElement;

  if (event instanceof HTMLElement) {
    element = event;
  }

  var isFullscreen =
    document.webkitIsFullScreen || document.mozFullScreen || false;

  element.requestFullScreen =
    element.requestFullScreen ||
    element.webkitRequestFullScreen ||
    element.mozRequestFullScreen ||
    function () {
      return false;
    };
  document.cancelFullScreen =
    document.cancelFullScreen ||
    document.webkitCancelFullScreen ||
    document.mozCancelFullScreen ||
    function () {
      return false;
    };

  isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
}
