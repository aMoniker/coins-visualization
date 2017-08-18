'use strict';

const _ = require('lodash');
const THREE = require('three');

class Display {
    constructor(options = {}) {
        this.opts = _.assign({
            fov: 50,
            cameraDistance: 1000,
            antialias: true,
            domId: null,
            fadeIn: false,
        }, options);

        this.animationCallbacks = [];
        this.initialize();
    }

    initialize() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            this.opts.fov,
            window.innerWidth / window.innerHeight,
            0.1, this.opts.cameraDistance
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.opts.antialias
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        let domElement = this.opts.domId
            ? document.getElementById(this.opts.domId)
            : document.body;
        domElement.appendChild(this.renderer.domElement);

        if (this.opts.fadeIn) {
            this.addFade();
        }

        window.onresize = function() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }.bind(this);
    }

    addFade() {
        var opacity = 0;
        this.renderer.domElement.style.opacity = opacity;
        let fadeIn = function() {
            opacity += 0.03;
            this.renderer.domElement.style.opacity = opacity;
            if (this.renderer.domElement.style.opacity >= 1) {
                this.animationCallbacks.shift(); // remove this callback
            }
        };
        this.addAnimation(fadeIn.bind(this));
    }

    addAnimation(animationCallback) {
        this.animationCallbacks.push(animationCallback);
        return this;
    }

    animate() {
        // if (this.foo) {
        //     return;
        // }
        // this.foo = true;
        requestAnimationFrame(this.getAnimateFunction());
        for (let callback of this.animationCallbacks) {
            callback();
        }
        this.renderer.render(this.scene, this.camera);
    }

    getAnimateFunction() {
        if (!this.animateFunction) {
            this.animateFunction = this.animate.bind(this);
        }
        return this.animateFunction;
    }

    showAxes(options = {}) {
        let origin = _.assign({
            x: 0, y: 0, z: 0,
            distance: 100000,
        }, options);

        let lineMaterialX = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 1,
        });
        let lineMaterialY = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 1,
        });
        let lineMaterialZ = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 1,
        });

        let AxisXGeometry = new THREE.Geometry();
        let AxisYGeometry = new THREE.Geometry();
        let AxisZGeometry = new THREE.Geometry();
        AxisXGeometry.vertices.push(
            new THREE.Vector3(origin.distance, origin.y, origin.z),
            new THREE.Vector3(-1 * origin.distance, origin.y, origin.z),
        );
        AxisYGeometry.vertices.push(
            new THREE.Vector3(origin.x, origin.distance, origin.z),
            new THREE.Vector3(origin.x, -1 * origin.distance, origin.z),
        );
        AxisZGeometry.vertices.push(
            new THREE.Vector3(origin.x, origin.y, origin.distance),
            new THREE.Vector3(origin.x, origin.y, -1 * origin.distance),
        );

        var lineX = new THREE.Line(AxisXGeometry, lineMaterialX);
        var lineY = new THREE.Line(AxisYGeometry, lineMaterialY);
        var lineZ = new THREE.Line(AxisZGeometry, lineMaterialZ);
        this.scene.add(lineX, lineY, lineZ);
    }
}

module.exports = {
    Display
};
