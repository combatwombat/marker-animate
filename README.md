# Animated marker movement in Google Maps

A nice alternative to `marker.setPosition(latLng)`. Include jQuery and jQuery Easing Plugin for more easing options.

Demo: http://robsite.net/static/markermove/markermove.html (click on the map)

## Usage

Include `markerAnimate.js` after Google Maps and call `animateTo` on a `google.maps.Marker`:

    // params:
    // newPosition        - the new Position as google.maps.LatLng()
    // options.duration   - animation duration in ms (default 1000)
    // options.easing     - easing function from jQuery and/or the jQuery easing plugin (default 'linear')
    // options.complete   - callback function. Gets called, after the animation has finished

    marker.animateTo(newPosition [, {easing: 'easeOutBounce', duration: 1000, complete: function(){}}]);

## Example

    var marker = new google.maps.Marker({position: new google.maps.LatLng(0,0), map: myMap, title: 'Hello World!'});
    var newPosition = new google.maps.LatLng(13,42);

    // move marker in 1000ms and with linear animation.
    marker.animateTo(newPosition); 

    // or with callback and options for easing and duration in milliseconds. Needs jQuery Easing Plugin.
    marker.animateTo(newPosition, {  easing: "easeOutBounce",
                                     duration: 1000,
                                     complete: function() {
                                       alert("animation complete");
                                     }
                                  });
