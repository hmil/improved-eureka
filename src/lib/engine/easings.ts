
export type EasingFunction = (x: number) => number;

export const EASINGS = {
    linear: (t: number) => t,
    easeInOut: (t: number) => {
        const v = t - 1;
        if (t < 0.5) {
            return t * t * 2;
        }
        return -2 * v * v + 1;
    },
    easeIn: (t: number) => {
        return t * t;
    },
    easeOut: (t: number) => {
        return -(t - 1) * (t - 1) + 1;
    }
};
