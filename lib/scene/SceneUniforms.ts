import * as THREE from "three";

// Colors mapped exactly from The Forge design system
const COLOR_EMBER = new THREE.Color("#FF5A36");
const COLOR_PROOF_VIOLET = new THREE.Color("#8B7CFF");
const COLOR_CANVAS = new THREE.Color("#0A0908");

export const sceneUniforms = {
  uTime: { value: 0 },
  uPointer: { value: new THREE.Vector2(0.5, 0.5) },
  uColorEmber: { value: COLOR_EMBER },
  uColorViolet: { value: COLOR_PROOF_VIOLET },
  uColorCanvas: { value: COLOR_CANVAS },
  uStateBlend: { value: 0.0 }, // 0 = Hero, 1 = Problem, 2 = Forge, etc.
  uIntensity: { value: 1.0 },
};
