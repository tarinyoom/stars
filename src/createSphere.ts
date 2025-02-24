import { Mesh } from "./types";

export function createSphere(radius: number, latitudeBands: number, longitudeBands: number, xOffset: number): Mesh {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = (lat * Math.PI) / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = (lon * 2 * Math.PI) / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            const u = lon / longitudeBands; // Generate UV coordinates
            const v = lat / latitudeBands;

            positions.push(radius * x + xOffset, radius * y, radius * z);
            normals.push(x, y, z);
            texCoords.push(1 - u, v); // Flip U coordinate
        }
    }

    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = lat * (longitudeBands + 1) + lon;
            const second = first + longitudeBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        texCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices),
    };
}
