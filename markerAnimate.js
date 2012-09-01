// Animated Marker Movement. Robert Gerlach 2012 http://robsite.net/google-maps-animated-marker-move
//
// params:
// newPosition - the new Position as google.maps.LatLng()
// options - optional options object (optional)
// options.duration - animation duration in ms (default 1000)
// options.easing - easing function from jQuery and/or the jQuery easing plugin (default 'linear')
google.maps.Marker.prototype.animateTo = function(newPosition, options) {
  defaultOptions = {
    duration: 1000,
    easing: 'linear'
  }
  options = options || {};

  // complete missing options
  for (key in defaultOptions) {
    options[key] = options[key] || defaultOptions[key];
  }

  // throw exception if easing function doesn't exist
  if (options.easing != 'linear') {            
    if (typeof jQuery == 'undefined' || !jQuery.easing[options.easing]) {
      throw '"' + options.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
      return;
    }
  }
  
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  // save current position. prefixed to avoid name collisions
  this.AT_startPosition = this.getPosition();

  var animateStep = function(marker, startTime) {            
    var ellapsedTime = (new Date()).getTime() - startTime;
    var durationRatio = ellapsedTime / options.duration; // 0 - 1
    var easingDurationRatio = durationRatio;

    // use jQuery easing if it's not linear
    if (options.easing != 'linear') {
      easingDurationRatio = jQuery.easing[options.easing](durationRatio, ellapsedTime, 0, 1, options.duration);
    }
    
    if (durationRatio < 1) {
      var deltaPosition = new google.maps.LatLng( marker.AT_startPosition.Xa + (newPosition.Xa - marker.AT_startPosition.Xa)*easingDurationRatio,
                                                  marker.AT_startPosition.Ya + (newPosition.Ya - marker.AT_startPosition.Ya)*easingDurationRatio);
      marker.setPosition(deltaPosition);

      // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
      if (window.requestAnimationFrame) {
        marker.AT_animationHandler = window.requestAnimationFrame(function() {animateStep(marker, startTime)});                
      } else {
        marker.AT_animationHandler = setTimeout(function() {animateStep(marker, startTime)}, 17); 
      }

    } else {
      marker.setPosition(newPosition);
    }            
  }

  // stop possibly running animation
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(this.AT_animationHandler);
  } else {
    clearTimeout(this.AT_animationHandler); 
  }
  
  animateStep(this, (new Date()).getTime());
}