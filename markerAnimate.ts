// Animated Marker, based on work by
// Robert Gerlach 2012-2013 https://github.com/combatwombat/marker-animate
// MIT license
// Copyright (C) 2012 Robert Gerlach
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import MarkerOptions = google.maps.MarkerOptions;
import LatLng = google.maps.LatLng;
import Animation = google.maps.Animation;
import * as _ from 'lodash';
import Icon = google.maps.Icon;

declare var jQuery:any;

export class AnimatedMarkerOptions implements MarkerOptions {
    duration?: number = 2000;
    easing?: string = 'linear';
    complete?: () => void = ()=>{};
    startLat?: number;
    startLng?: number;

    //Overriding MarkerOptions
    animation?:Animation = Animation.DROP;
    icon: string|Icon|google.maps.Symbol;
    map: google.maps.Map;
    position: LatLng;
}

export default class AnimatedMarker extends google.maps.Marker {

    animatedMarkerOptions: AnimatedMarkerOptions;

    _AT: any;

    constructor(options: AnimatedMarkerOptions) {
        super(options);

        this.animatedMarkerOptions = options;
    }

    /**
     * animate to other location
     * @param newPosition        - the new Position as google.maps.LatLng()
     * @param overrideOptions    - optional options object (optional)
     *          - duration   - animation duration in ms (default 1000)
     *          - easing     - easing function from jQuery and/or the jQuery easing plugin (default 'linear')
     *          - complete   - callback function. Gets called, after the animation has finished
     *          - startLat   - alternative start latitude, if not provided marker's position will be used
     *          - startLng   - alternative start longitude, if not provided marker's position will be used
     */
    public animateTo (newPosition: LatLng, overrideOptions?: AnimatedMarkerOptions) {

        // complete missing options
        const effectiveOptions = _.defaultsDeep({}, overrideOptions, this.animatedMarkerOptions);

        // throw exception if easing function doesn't exist
        if (effectiveOptions.easing !== 'linear') {
            if (typeof jQuery == 'undefined' || !jQuery.easing[effectiveOptions.easing]) {
                throw '"' + effectiveOptions.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
            }
        }

        window.requestAnimationFrame = (<any>window).requestAnimationFrame || (<any>window).mozRequestAnimationFrame || (<any>window).webkitRequestAnimationFrame || (<any>window).msRequestAnimationFrame;
        window.cancelAnimationFrame = (<any>window).cancelAnimationFrame || (<any>window).mozCancelAnimationFrame;

        // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
        this._AT = {
            startPosition_lat: effectiveOptions.startLat,
            startPosition_lng: effectiveOptions.startLng,
            options: effectiveOptions,
            newPosition: newPosition
        };
        let newPosition_lat = newPosition.lat();
        let newPosition_lng = newPosition.lng();

        // crossing the 180° meridian and going the long way around the earth?
        if (Math.abs(newPosition_lng - this._AT.startPosition_lng) > 180) {
            if (newPosition_lng > this._AT.startPosition_lng) {
                newPosition_lng -= 360;
            } else {
                newPosition_lng += 360;
            }
        }

        //if AT_setPositionNoAnimation set, it will be called instead of setPosition.
        // const setPosition = this.AT_setPositionNoAnimation || this.setPosition;

        const animateStep = (marker, startTime) => {
            const ellapsedTime = (new Date()).getTime() - startTime;
            const durationRatio = ellapsedTime / effectiveOptions.duration; // 0 - 1
            let easingDurationRatio = durationRatio;

            // use jQuery easing if it's not linear
            if (effectiveOptions.easing !== 'linear') {
                easingDurationRatio = jQuery.easing[effectiveOptions.easing](durationRatio, ellapsedTime, 0, 1, effectiveOptions.duration);
            }

            if (durationRatio < 1) {
                const deltaPosition = new google.maps.LatLng( marker._AT.startPosition_lat + (newPosition_lat - marker._AT.startPosition_lat)*easingDurationRatio,
                    marker._AT.startPosition_lng + (newPosition_lng - marker._AT.startPosition_lng)*easingDurationRatio);
                this.setPosition.call(marker, deltaPosition);

                // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~30 fps
                if (window.requestAnimationFrame) {
                    marker._AT.animationHandler = window.requestAnimationFrame(function() {animateStep(marker, startTime)});
                } else {
                    // marker._AT.animationHandler = setTimeout(function() {animateStep(marker, startTime)}, 17);
                    marker._AT.animationHandler = setTimeout(function() {animateStep(marker, startTime)}, 34);
                }

            } else {

                this.setPosition.call(marker, newPosition);

                if (typeof effectiveOptions.complete === 'function') {
                    effectiveOptions.complete();
                }
            }
        };

        // stop possibly running animation
        if (window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this._AT.animationHandler);
        } else {
            clearTimeout(this._AT.animationHandler);
        }

        animateStep(this, (new Date()).getTime());
    }

    /**
     * jumpToEnd - default true.
     */
    public stopAnimation (jumpToEnd) {
        if (this._AT) {

            if (jumpToEnd === undefined) {
                jumpToEnd = true;
            }

            if (window.cancelAnimationFrame) {
                window.cancelAnimationFrame(this._AT.animationHandler);
            } else {
                clearTimeout(this._AT.animationHandler);
            }

            if (jumpToEnd) {
                this.setPosition.call(this, this._AT.newPosition);
            }
            
            const options = this._AT.options;

            //free up resources
            delete this._AT;

            if (typeof options.complete === 'function') {
                options.complete();
            }
        }
    }
}
