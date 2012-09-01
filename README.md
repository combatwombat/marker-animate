# Animated marker movement in Google Maps

An nice alternative to `marker.setPosition(latLng)`. Include jQuery and jQuery Easing Plugin for more easing options.

Demo: 

## Usage

    // params:
    // newPosition - the new Position as google.maps.LatLng()
    // options.duration - animation duration in ms (default 1000)
    // options.easing - easing function from jQuery and/or the jQuery easing plugin (default 'linear')

    marker.animateTo(newPosition [, {easing: 'easeOutBounce', duration: 1000}]);

## Example

    var marker = new google.maps.Marker({position: new google.maps.LatLng(0,0), map: myMap, title: 'Hello World!'});
    var newPosition = new google.maps.LatLng(13,42);

    // move marker in 1000ms and with linear animation.
    marker.animateTo(newPosition); 

    // or with options for easing and duration in milliseconds. Needs jQuery Easing Plugin.
    marker.animateTo(newPosition, {easing: "easeOutBounce", duration: 1000});