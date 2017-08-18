'use strict';

const THREE = require('three');

class Coins {
    constructor() {
        this.setRadius(3); // default radius
        this.coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.5,
            metalness: 1.0,
        });
    }

    setRadius(radius) {
        this.coinRadius = radius;
        this.coinGeometry = this.generateCoinGeometry();
    }

    generateCoinGeometry() {
        let coinThickness = 0.18 * this.coinRadius;
        let textScale = 0.16 * this.coinRadius;
        let extrudeThickness = coinThickness / 4;
        let bevelThickness = 0.25;
        let textThickness = extrudeThickness + bevelThickness;
        let extrudeOptions = {
            amount: extrudeThickness,
            steps: 1,
            curveSegments: 24,
            bevelEnabled: true,
            bevelSize: bevelThickness,
            bevelThickness: bevelThickness,
            bevelSegments: 2,
        };

        // create the base coin geometry
        let ringGeometry = new THREE.TorusGeometry(
            this.coinRadius, (0.1 * this.coinRadius), 8, 64
        );
        let cylGeometry  = new THREE.CylinderGeometry(
            this.coinRadius, this.coinRadius, coinThickness, 16
        );
        cylGeometry.rotateX(Math.PI / 2);

        // create the "1" mesh
        let oneShape = new THREE.Shape();
        oneShape.moveTo(-3, 1);
        oneShape.lineTo(-3, 2);
        oneShape.bezierCurveTo(-2.75, 1.75, -0.75, 3.5, -1, 4);
        oneShape.lineTo(1, 4);
        oneShape.lineTo(1, -3);
        oneShape.lineTo(3, -3);
        oneShape.lineTo(3, -4);
        oneShape.lineTo(-3, -4);
        oneShape.lineTo(-3, -3);
        oneShape.lineTo(-1, -3);
        oneShape.lineTo(-1, 2);
        oneShape.bezierCurveTo(-0.8, 1.8, -2.8, 0.8, -3, 1);
        let oneGeometry = new THREE.ExtrudeGeometry(oneShape, extrudeOptions);
        let oneMesh = new THREE.Mesh(oneGeometry, this.coinMaterial);

        // scale and position the "1" mesh to jut out of the coin
        oneMesh.position.z -= (extrudeThickness / 2) * textScale; // center
        oneMesh.position.z += (coinThickness) / 2; // offset to edge
        oneMesh.position.z -= (textThickness / 2) * textScale; // adjust
        oneMesh.scale.set(textScale, textScale, textScale);

        // create the "0" mesh
        let zeroShape = new THREE.Shape();
        zeroShape.moveTo(0, 4);
        zeroShape.bezierCurveTo(4, 4, 4, -4, 0, -4);
        zeroShape.bezierCurveTo(-4, -4, -4, 4, 0, 4);
        let zeroHole = new THREE.Path();
        zeroHole.moveTo(0, 2.5);
        zeroHole.bezierCurveTo(-2.5, 2.5, -2.5, -2.5, 0, -2.5);
        zeroHole.bezierCurveTo(2.5, -2.5, 2.5, 2.5, 0, 2.5);
        zeroShape.holes.push(zeroHole);
        let zeroSlash = new THREE.Shape();
        zeroSlash.moveTo(-3.5, -2.5);
        zeroSlash.lineTo(2.5, 3.5);
        zeroSlash.lineTo(3.5, 2.5);
        zeroSlash.lineTo(-2.5, -3.5);
        zeroSlash.lineTo(-3.5, -2.5);
        let zeroGeometry = new THREE.ExtrudeGeometry(zeroShape, extrudeOptions);
        let zeroSlashGeometry = new THREE.ExtrudeGeometry(zeroSlash, extrudeOptions);
        let zeroMesh = new THREE.Mesh(zeroGeometry, this.coinMaterial);
        let zeroSlashMesh = new THREE.Mesh(zeroSlashGeometry, this.coinMaterial);

        // scale and position the "0" meshes to jut out of the coin
        zeroMesh.scale.set(textScale, textScale, textScale);
        zeroSlashMesh.scale.set(textScale, textScale, textScale);
        zeroMesh.position.z -= (extrudeThickness / 2) * textScale; // center
        zeroSlashMesh.position.z -= (extrudeThickness / 2) * textScale; // center
        zeroMesh.position.z -= (coinThickness) / 2; // offset to edge
        zeroSlashMesh.position.z -= (coinThickness) / 2; // offset to edge
        zeroMesh.position.z += (textThickness / 2) * textScale; // adjust
        zeroSlashMesh.position.z += (textThickness / 2) * textScale; // adjust

        // assemble the coin geometry out of the constituent geometries/meshes
        let coinGeometry = new THREE.Geometry();
        coinGeometry.merge(ringGeometry);
        coinGeometry.merge(cylGeometry);
        coinGeometry.mergeMesh(oneMesh);
        coinGeometry.mergeMesh(zeroMesh);
        coinGeometry.mergeMesh(zeroSlashMesh);

        return coinGeometry;
    }

    createCoin() {
        return new THREE.Mesh(this.coinGeometry, this.coinMaterial);
    }

    createCoins(n = 1) {
        let coins = [];
        for (let i = 0; i < n; i++) {
            coins.push(this.createCoin());
        }
        return coins;
    }
};

module.exports = {
    Coins: new Coins
};
