'use strict';

const _ = require('lodash');
var THREE = require('three');
const {Display} = require('./display');
const {Coins} = require('./coins');
const {CoinTunnel} = require('./coin-tunnel');

const debug = false;
const tunnelLength = 400;
const speed = 0.0015;

const display = new Display({
    domId: 'canvas',
    cameraDistance: (debug ? 5000 : tunnelLength),
    fov: 35,
    fadeIn: true,
});

var coinTunnel = new CoinTunnel({
    totalCoins: Math.min(window.innerWidth * 0.5, 1337),
    radius: Math.max(window.innerWidth * 0.07, 50),
    length: tunnelLength,
    rotateTunnel: true,
    tunnelRotationSpeed: 0.00025,
    coinRotationSpeed: 0.06,
    pathSpeedMin: speed,
    pathSpeedMax: speed,
    debug: debug,
});

display.camera.position.y = -1 * (coinTunnel.opts.length / 2);
display.camera.lookAt(new THREE.Vector3(0, 0, 0));
display.scene.add(coinTunnel.tunnel);

// debugging
if (debug) {
    require('./orbit-controls');
    var controls = new THREE.OrbitControls(display.camera, display.renderer.domElement);
    controls.maxDistance = 750;
    display.showAxes();
}

// lighting - two directional lights from the left and right
let color = 0xffffff;
let intensity = 1.5;
var directionalLightLeft = new THREE.DirectionalLight(color, intensity);
directionalLightLeft.position.y = 0;
directionalLightLeft.position.z = 0;
directionalLightLeft.position.x = -1;
var directionalLightRight = new THREE.DirectionalLight(color, intensity);
directionalLightRight.position.y = 0;
directionalLightRight.position.z = 0;
directionalLightRight.position.x = 1;
// display.scene.add(directionalLightLeft, directionalLightRight);
display.scene.add(directionalLightLeft);
display.scene.add(directionalLightRight);

// start the animation loop
display.addAnimation(coinTunnel.animateStep.bind(coinTunnel)).animate();
