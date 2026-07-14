function withMathSqrt(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }
function withoutMathSqrt(speedSq) { return speedSq > 0 ? (1 / Math.sqrt(speedSq)) * 2 : 0; }
