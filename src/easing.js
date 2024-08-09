

const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = 2.70158;
const c4 = (2.0 * Math.PI) / 3.0;
const c5 = (2.0 * Math.PI) / 4.5;
const n1 = 7.5625;
const d1 = 2.75;

export const Easing = {
  linear(x) { return x; },
  in_sine(x) { return 1 - Math.cos((x - Math.PI) * 0.5); },
  out_sine(x) { return Math.sin((x - Math.PI) * 0.5); },
  in_out_sine(x) { return -(Math.cos(Math.PI * x) - 1.0) * 0.5; },
  in_quad(x) { return x * x; },
  out_quad(x) { return 1 - (1 - x) * (1 - x); },
  in_out_quad(x) { return x < 0.5 ? 2.0 * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 2.0) * 0.5; },
  in_cubic(x) { return x * x * x; },
  out_cubic(x) { return 1.0 - Math.pow(1.0 - x, 3.0); },
  in_out_cubic(x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 3.0) * 0.5; },
  in_quart(x) { return x * x * x * x; },
  out_quart(x) { return 1.0 - Math.pow(1.0 - x, 4.0); },
  in_out_quart(x) { return x < 0.5 ? 8.0 * x * x * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 4.0) * 0.5; },
  in_quint(x) { return x * x * x * x * x; },
  out_quint(x) { return 1.0 - Math.pow(1.0 - x, 5.0); },
  in_out_quint(x) { return x < 0.5 ? 16.0 * x * x * x * x * x : 1.0 - Math.pow(-2.0 * x + 2.0, 5.0) * 0.5; },
  in_expo(x) { return Math.abs(x) < Number.EPSILON ? 0.0 : Math.pow(2.0, 10.0 * x - 10.0); },
  out_expo(x) { return Math.abs(x) < Number.EPSILON ? 1.0 : 1.0 - Math.pow(2.0, -10.0 * x); },
  in_out_expo(x) {
    return Math.abs(x) < Number.EPSILON
      ? 0.0
      : (Math.abs(x) - 1.0) < Number.EPSILON
        ? 1.0
        : x < 0.5
          ? Math.pow(2.0, 20.0 * x - 10.0) * 0.5
          : (2.0 - Math.pow(2.0, -20.0 * x + 10.0)) * 0.5;
  },
  in_circ(x) { return 1.0 - Math.sqrt(1.0 - Math.pow(x, 2.0)); },
  out_circ(x) { return Math.sqrt(1.0 - Math.pow(x - 1.0, 2.0)); },
  in_out_circ(x) {
    return x < 0.5
      ? (1.0 - Math.sqrt(1.0 - Math.pow(2.0 * x, 2.0))) * 0.5
      : (Math.sqrt(1.0 - Math.pow(-2.0 * x + 2.0, 2.0)) + 1.0) * 0.5;
  },
  in_back(x) { return c1 * x * x * x - c3 * x * x; },
  out_back(x) { return 1.0 + c3 + Math.pow(x - 1.0, 3.0) + c1 * Math.pow(x - 1.0, 2.0); },
  in_out_back(x) {
    return x < 0.5
      ? (Math.pow(2.0 * x, 2.0) * ((c2 + 1.0) * 2.0 * x - c2)) * 0.5
      : (Math.pow(2.0 * x - 2.0, 2.0) * ((c2 + 1.0) * (x * 2.0 - 2.0) + c2) + 2.0) * 0.5;
  },
  in_elastic(x) {
    return Math.abs(x) < Number.EPSILON
      ? 0.0
      : (Math.abs(x) - 1.0) < Number.EPSILON
        ? 1.0
        : -Math.pow(2.0, 10.0 * x - 10.0) * Math.sin((x * 10.0 - 10.75) * c4);
  },
  out_elastic(x) {
    return Math.abs(x) < Number.EPSILON
      ? 0.0
      : (Math.abs(x) - 1.0) < Number.EPSILON
        ? 1.0
        : Math.pow(2.0, -10.0 * x) * Math.sin((x * 10.0 - 0.75) * c4) + 1.0;
  },
  in_out_elastic(x) {
    return Math.abs(x) < Number.EPSILON
      ? 0.0
      : (Math.abs(x) - 1.0) < Number.EPSILON
        ? 1.0
        : x < 0.5
          ? -(Math.pow(2.0, 20.0 * x - 10.0) * Math.sin((20.0 * x - 11.125) * c5)) * 0.5
          : (Math.pow(2.0, -20.0 * x + 10.0) * Math.sin((20.0 * x - 11.125) * c5)) * 0.5 + 1.0;
  },
  in_bounce(x) { return 1.0 - Easing.out_bounce(1.0 - x); },
  out_bounce(x) {
    if (x < 1.0 / d1)
      return n1 * x * x;
    else if (x < 2.0 / d1)
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    else if (x < 2.5 / d1)
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    else
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
  },
  in_out_bounce(x) {
    return x < 0.5
      ? (1.0 - Easing.out_bounce(1.0 - 2.0 * x)) * 0.5
      : (1.0 + Easing.out_bounce(2.0 * x - 1.0)) * 0.5;
  },
};