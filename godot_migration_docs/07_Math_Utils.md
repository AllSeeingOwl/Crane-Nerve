# Reference: mathLUT.ts

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
// ⚡ BOLT OPTIMIZATION: High-performance Trigonometry Lookup Table (LUT)
// Avoiding native Math.sin/Math.cos in 60fps requestAnimationFrame loops.
// Size: 4096 (power of 2 allows bitwise masking for fast wrapping)
const LUT_SIZE = 4096;
const LUT_MASK = LUT_SIZE - 1;
const TWO_PI = Math.PI * 2;

// Float32Array is faster for dense numeric data
const sinLUT = new Float32Array(LUT_SIZE);
const cosLUT = new Float32Array(LUT_SIZE);

for (let i = 0; i < LUT_SIZE; i++) {
  const angle = (i / LUT_SIZE) * TWO_PI;
  sinLUT[i] = Math.sin(angle);
  cosLUT[i] = Math.cos(angle);
}

// Map a radian angle to the LUT index
// Handles negative angles via modulo and bitwise AND
const getIndex = (angle: number): number => {
  return Math.round((angle / TWO_PI) * LUT_SIZE) & LUT_MASK;
};

export const fastSin = (angle: number): number => {
  return sinLUT[getIndex(angle)];
};

export const fastCos = (angle: number): number => {
  return cosLUT[getIndex(angle)];
};

```
