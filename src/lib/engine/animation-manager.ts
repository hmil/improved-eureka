
export interface Animation {
    stop(): void;
}

export interface AnimationCallback {
    (time: number): void;
}

export interface AnimationListener {
    onAnimationFrame(): void;
}

interface AnimationDescriptor {
    startTime: number;
    durationMs: number; // -1 = continuous
    onFinished?: () => void;
    cb: AnimationCallback;
}

export class AnimationManager {

    private animations: AnimationDescriptor[] = [];
    private isRunning: boolean = false;

    constructor(private readonly listener: AnimationListener) { }

    animate(cb: AnimationCallback, durationMs: number, onFinished?: () => void): Animation {
        const anim = {
            startTime: Date.now(),
            durationMs,
            onFinished,
            cb
        };
        this.animations.push(anim);
        this.run();

        return {
            stop: () => {
                const idx = this.animations.indexOf(anim);
                if (idx < 0) {
                    return;
                }
                if (onFinished != null) {
                    onFinished();
                }
                this.animations.splice(idx, 1);
            }
        }
    }

    run() {
        if (this.isRunning) {
            return;
        }
        requestAnimationFrame(this.animFrame);
        this.isRunning = true;
    }

    private animFrame = () => {
        const now = Date.now();
        if (this.animations.length === 0) {
            this.isRunning = false;
            return;
        }

        const toFinish: Array<() => void> = [];

        const nextAnimations: AnimationDescriptor[] = [];
        this.animations.forEach(anim => {
            let time = now - anim.startTime;
            if (anim.durationMs > 0 && time > anim.durationMs) {
                time = anim.durationMs;
                if (anim.onFinished != null) {
                    toFinish.push(anim.onFinished);
                }
            } else {
                nextAnimations.push(anim);
            }
            anim.cb(time);
        });
        this.animations = nextAnimations;

        requestAnimationFrame(this.animFrame);
        this.listener.onAnimationFrame();

        for (const cb of toFinish) {
            cb();
        }
    };
}