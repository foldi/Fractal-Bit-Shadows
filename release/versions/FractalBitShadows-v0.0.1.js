/*! FractalBitShadows v0.0.1 - 2013-10-05 04:10:49 
 *  Vince Allen 
 *  Brooklyn, NY 
 *  vince@vinceallen.com 
 *  @vinceallenvince 
 *  License: MIT */

var FractalBitShadows = {}, exports = FractalBitShadows;

(function(exports) {

"use strict";

function Chaos(opt_options) {

  var options = opt_options || {};

	if (!BitShadowMachine) {
    throw new Error('Chaos requires BitShadowMachine.');
  }

  this.world = options.world || Chaos._createDefaultWorld();
  this.resolution = typeof options.resolution === 'undefined' ? 2 : options.resolution;
  this.colorMode = options.colorMode || 'rgba';
  this.backgroundWidth = typeof options.backgroundWidth === 'undefined' ? 960 : options.backgroundWidth;
  this.backgroundHeight = typeof options.backgroundHeight === 'undefined' ? 540 : options.backgroundHeight;
  this.backgroundColor = options.backgroundColor || [0, 0, 0];
  this.backgroundHue = typeof options.backgroundHue === 'undefined' ? 0 : options.backgroundHue;
  this.backgroundSaturation = typeof options.backgroundSaturation === 'undefined' ? 0 : options.backgroundSaturation;
  this.backgroundLightness = typeof options.backgroundLightness === 'undefined' ? 0 : options.backgroundLightness;

  this.palette = options.palette || Chaos._createDefaultPalette();
  this.maxScale = typeof options.maxScale === 'undefined' ? 40 : options.maxScale;
  this.depth = typeof options.depth === 'undefined' ? 9 : options.depth;
  this.maxShapes = typeof options.maxShapes === 'undefined' ? 3 : options.maxShapes;
  this.maxOpacity = typeof options.maxOpacity === 'undefined' ? 0.5 : options.maxOpacity;

  this.hue = typeof options.hue === 'undefined' ? 200 : options.hue;
  this.saturation = typeof options.saturation === 'undefined' ? 0.5 : options.saturation;
  this.lightness = typeof options.lightness === 'undefined' ? 0.5 : options.lightness;
  this.blur = typeof options.blur === 'undefined' ? 0 : options.blur;

  this.initOffsetAngle = typeof options.initOffsetAngle === 'undefined' ? 0 : options.initOffsetAngle;
  this.initOpacity = typeof options.initOpacity === 'undefined' ? 0 : options.initOpacity;

  this.getDist = options.getDist || function(pt) {
    return pt.scale * 1.5;
  };

  this.angleOffset = typeof options.angleOffset === 'undefined' ? 0 : options.angleOffset;
  this.getAngles = options.getAngles || function(angleOffset) {
    return [
      this.angleOffset,
      this.angleOffset + Math.PI * 2 / 3,
      this.angleOffset + Math.PI * 4 / 3
    ];
  };
}

/**
 * Creates a color palette.
 * @private
 * @returns {Object} A color palette.
 */
Chaos._createDefaultPalette = function() {
  var palette = new BitShadowMachine.ColorPalette();
  palette.addColor({
    min: 12,
    max: 24,
    startColor: [196, 213, 86],
    endColor: [166, 183, 56]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [56, 139, 126],
    endColor: [26, 109, 96]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [104, 233, 212],
    endColor: [74, 203, 182]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [233, 158, 104],
    endColor: [203, 128, 74]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [191, 75, 49],
    endColor: [171, 55, 19]
  });
  return palette;
};

/**
 * Creates and appends a DOM element to use for
 * a BitShadowMachine world.
 * @private
 * @returns {Object} A DOM element.
 */
Chaos._createDefaultWorld = function() {
  var world = document.createElement('div');
  world.id = 'worldA';
  document.body.appendChild(world);
  return world;
};

/**
 * Renders the fractal pattern.
 */
Chaos.prototype.render = function() {

  var me = this;

  var worldA = new BitShadowMachine.World(this.world, {
    width: this.backgroundWidth,
    height: this.backgroundHeight,
    resolution: this.resolution,
    borderRadius: 100,
    backgroundColor: this.backgroundColor,
    colorMode: this.colorMode,
    hue: this.backgroundHue,
    saturation: this.backgroundSaturation,
    lightness: this.backgroundLightness,
    gravity: new BitShadowMachine.Vector(),
    noMenu: true
  });

  BitShadowMachine.Classes = {
    Point: Point
  };
  BitShadowMachine.System.totalFrames = 1;

  BitShadowMachine.System.init(function() {

    var initPoint = this.add('Point', {
      scale: me.maxScale,
      offsetAngle: me.initOffsetAngle,
      opacity: me.initOpacity,
      blur: me.blur,
      hue: me.hue,
      saturation: me.saturation,
      lightness: me.lightness,
      color: me.palette.getColor()
    });

    Chaos._iterate.call(me, this, initPoint, me.depth - 1);

  }, worldA);
};

/**
 * A recursive function that renders the fractal pattern.
 *
 * @param {Object} system A BitShadowMachine system.
 * @param {Object} initPoint The parent object to use when creating new children.
 * @param {number} depth The remaining iterations.
 */
Chaos._iterate = function(system, initPoint, depth) {

  var utils = BitShadowMachine.Utils;

  // scale down
  var scale = initPoint.scale * 0.6;

  // get distance for all points
  var dist = this.getDist.call(this, initPoint);

  var angles = this.getAngles.call(this);

  for (var i = 0; i < this.maxShapes; i++) {

    // take parent location
    var loc = new BitShadowMachine.Vector(initPoint.location.x, initPoint.location.y);

    // create an offset
    var offset = new BitShadowMachine.Vector(1, 1);
    offset.normalize();
    var offsetAngle = initPoint.offsetAngle + angles[i];
    offset.rotate(offsetAngle);
    offset.mult(dist);

    // add offset to location
    loc.add(offset);

    // create a new point
    var newPoint = system.add('Point', {
      location: loc,
      scale: scale,
      offsetAngle: offsetAngle,
      opacity: utils.map(scale, 0, this.maxScale, this.maxOpacity, 0),
      blur: initPoint.blur,
      hue: initPoint.hue,
      saturation: initPoint.saturation,
      lightness: initPoint.lightness,
      color: this.palette.getColor()
    });
    if (depth > 0) {
      Chaos._iterate.call(this, system, newPoint, depth - 1);
    }
  }
};

/* example distance functions
  getDist: function(pt) {
    return pt.scale * Math.random() * 3 + 1;
  }

  getDist: function(pt) {
    return pt.scale * 3.5;
  }
*/

exports.Chaos = Chaos;

function Point(opt_options) {

  var options = opt_options || {};
  options.name = 'Point';
  BitShadowMachine.Item.call(this, options);
}
BitShadowMachine.Utils.extend(Point, BitShadowMachine.Item);

/**
 * Initializes the Point.
 * @param {Object} options Initial options.
 */
Point.prototype.init = function(options) {
  this.width = options.width || 20;
  this.height = options.height || 20;
  this.color = options.color || [100, 100, 100];
  this.location = options.location || new BitShadowMachine.Vector(this.world.width / 2, this.world.height / 2);
};

/**
 * Updates properties.
 */
Point.prototype.step = function() {};
exports.Point = Point;

}(exports));