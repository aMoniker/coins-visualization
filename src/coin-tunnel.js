'use strict';

const _ = require('lodash');
const THREE = require('three');
const {Coins} = require('./coins');

class CoinTunnel {
    constructor(options = {}) {
        this.opts = _.assign({
            radius: 100,
            length: 400,
            totalCoins: 500,
            coinRotationSpeed: 0.05,
            pathSpeedMin: 0.001,
            pathSpeedMax: 0.001,
            rotateTunnel: false,
            tunnelRotationSpeed: 0.0005,
            excludeCenter: true,
            scalePoint: 0.05,
            debug: false,
        }, options);

        this.createTunnel();
        this.initCoins();
    }

    createTunnel() {
        this.calculateCoinPaths();
        this.tunnel = this.createTunnelMesh();

        if (this.opts.debug) {
            // draw paths
            let lineMaterial = new THREE.LineBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.5,
            });
            for (let path of this.coinPaths) {
                let lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(path.v1, path.v2);
                let line = new THREE.Line(lineGeometry, lineMaterial);
                this.tunnel.add(line);
            }
        }

    }

    // create the cylinder that will contain the tunnel of coins
    createTunnelMesh() {
        let tunnelGeometry = new THREE.CylinderGeometry(
            this.opts.radius, this.opts.radius, this.opts.length, 16
        );
        let tunnelMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: (this.opts.debug ? 0.5 : 0.0),
        });
        return new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    }

    getCoinSpeed() {
        let diff = this.opts.pathSpeedMax - this.opts.pathSpeedMin;
        let speed = (Math.random() * diff) + this.opts.pathSpeedMin;
        return speed;
    }

    setCoinRotation(coin) {
        // give the coin a random initial rotation
        coin.rotation.y = Math.PI * (0.5 * Math.random());
        coin.rotation.x = Math.PI * (0.5 * Math.random());
        coin.rotation.z = Math.PI * (0.5 * Math.random());

        // give the coin a random rotation speed
        // since a coin has no intermediate axis, all movement will center
        // around just two axes - the one going through the center of the coin,
        // and another formed by the combination of forces on the edge.
        // the z axis is the center axis in our case, so we choose
        // only one other axis to spin, in this case the x axis.
        // TODO - this should use quaternions
        coin.rotationPerStep = {
            x: (0.5 - Math.random()) * 2 * this.opts.coinRotationSpeed,
            z: (0.5 - Math.random()) * 2 * this.opts.coinRotationSpeed,
        };
    }

    randomizeCoinPath(coin) {
        // choose a random path for the coin
        coin.path = _.sample(this.coinPaths);

        // move the coin to the starting point of the path
        let point = coin.path.getPoint(coin.pathProgress);
        coin.position.x = point.x;
        coin.position.y = point.y;
        coin.position.z = point.z;
    }

    // initial population of the entire tunnel with coins
    initCoins() {
        this.coins = [];
        for (let i = 0; i < this.opts.totalCoins; i++) {
            let coin = this.spawnCoin();
            // console.log(coin);
            // coin.rotation.order = 'ZXY';
            this.coins.push(coin);
            this.tunnel.add(coin);
        }
    }

    spawnCoin() {
        if (!this.baseCoin) {
            this.baseCoin = Coins.createCoin();
        }
        let coin = this.baseCoin.clone();

        // set the coin speed and how far along the path it starts
        coin.pathProgressPerStep = this.getCoinSpeed();
        coin.pathProgress = Math.random();

        // initialize the coin at the start of a random path
        this.randomizeCoinPath(coin);

        // give the coin a randomized rotation
        this.setCoinRotation(coin);

        return coin;
    }

    calculateCoinPaths() {
        this.coinPaths = [];
        let numPaths = this.opts.totalCoins * 5;

        for (var i = 0; i < numPaths; i++) {
            let unitRadius = Math.random();
            let unitRadiusRoot = Math.sqrt(unitRadius);
            let theta = Math.random() * 2 * Math.PI;
            let scaledRadius = unitRadiusRoot * this.opts.radius;

            // because of the default orientation of the cylinder,
            // the position is plotted on x/z (looking top down) instead of x/y
            let x = scaledRadius * Math.cos(theta);
            let z = scaledRadius * Math.sin(theta);

            // exclude paths from an area around the center equal
            // to a coin's radius since that's where the camera will be placed
            // TODO - is there a cleaner way to do this with math?
            if (this.opts.excludeCenter) {
                if (Math.abs(x) < Coins.coinRadius) {
                    x = Coins.coinRadius * (x < 0 ? -1 : 1);
                }
                if (Math.abs(z) < Coins.coinRadius) {
                    z = Coins.coinRadius * (z < 0 ? -1 : 1);
                }
            }

            let startVector = new THREE.Vector3(x, this.opts.length / 2, z);
            let endVector = new THREE.Vector3(x, -1 * (this.opts.length / 2), z);
            let lineCurve = new THREE.LineCurve3(startVector, endVector);
            this.coinPaths.push(lineCurve);
        }
    }

    // animate all the coins in the tunnel,
    // and return them to the beginning when they've passed the end
    animateStep() {
        for (let coin of this.coins) {
            // coin rotation
            // TODO - use quaternions
            _.each(coin.rotationPerStep, (amount, axis) => {
                coin.rotation[axis] += amount;
            });

            // move the coin along its path
            coin.pathProgress += coin.pathProgressPerStep;
            let point = coin.path.getPoint(coin.pathProgress);
            coin.position.y = point.y;

            // when a coin reaches the end of its path,
            // reset it along a new random path and give it a new rotation
            if (coin.pathProgress > 1) {
                coin.pathProgress = 0;
                this.setCoinRotation(coin);
                this.randomizeCoinPath(coin);
            }

            // scale coins starting their path so they don't
            // just pop into existence which is slightly jarring
            let scale = coin.pathProgress <= this.opts.scalePoint
                ? Math.max(coin.pathProgress / this.opts.scalePoint, 0.0001)
                : 1;
            coin.scale.set(scale, scale, scale);
        }

        if (this.opts.rotateTunnel) {
            this.tunnel.rotation.y += this.opts.tunnelRotationSpeed;
        }
    }
}

module.exports = {
    CoinTunnel
};
