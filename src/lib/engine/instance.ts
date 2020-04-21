import { DecanEvent, ShapeInstance, ShapeTransition, ShapeAnimation } from 'lib/dsl/shape-builder';
import { ShapeImpl } from 'lib/shape';

import { DecanRenderingContext } from './rendering-context';
import { Animation, AnimationManager } from './animation-manager';
import { EASINGS, EasingFunction } from './easings';

interface StateAnimation {
    definition: ShapeAnimation<any, any, any>;
    anim: Animation;
}

export class Instance<Type extends string = string, Attrs = unknown, States extends string = 'default' | ':begin' | ':end'> implements ShapeInstance<Type, Attrs> {
    
    public get attrs(): Attrs {
        return this._attrs;
    }

    public get finalized(): boolean {
        return this._finalized;
    }

    private _attrs: Attrs;
    private _sourceAttrs?: Partial<Attrs>;
    private _targetAttrs: Partial<Attrs>;
    private _tweenDuration: number = 0;
    private currentTween?: Animation;
    private currentAnimations: Array<StateAnimation> = [];
    private previousAttrs?: Partial<Attrs>;

    private destroyed = false;
    private _finalized = false;

    constructor(
            private animations: AnimationManager,
            private state: States,
            public readonly def: ShapeImpl<Type, Attrs, States>,
            public readonly id: string,
            public readonly type: Type,
            public readonly hitColor: string,
            attrs: Attrs) {
        this.state = ':begin' as States;
        this._targetAttrs = this._attrs = this.def._attrs;
        this._attrs = this.computeAttributeSnapshot(':begin' as States, attrs);
        this.update(state, attrs);
    }

    update(state: States, attrs: Partial<Attrs>) {
        if (this.previousAttrs === attrs && state === this.state) {
            return;
        }
        this.previousAttrs = attrs;
    
        if (this.state != state) {
            const animForCurrentState = this.def._animations.filter(a => a.states.indexOf(state) >= 0);
            const newAnimations: StateAnimation[] = [];

            animForCurrentState.forEach(currentAnim => {
                const prevIdx = this.currentAnimations.findIndex(a => a.definition === currentAnim);
                if (prevIdx >= 0) {
                    console.log('reusing');
                    newAnimations.push(this.currentAnimations[prevIdx]);
                    this.currentAnimations.splice(prevIdx, 1);
                } else {
                    newAnimations.push({
                        anim: this.animations.animate((time) => {
                            Object.assign(this._targetAttrs, currentAnim.animate(time / 1000, this));
                            if (this.currentTween == null) {
                                Object.assign(this._attrs, this._targetAttrs);
                            }
                        }, -1),
                        definition: currentAnim
                    });
                }
            });

            for (const previousAnim of this.currentAnimations) {
                previousAnim.anim.stop();
            }
            this.currentAnimations = newAnimations;
        }

        const nextAttrs = this.computeAttributeSnapshot(state, attrs);
        const transition = this.findTransition(this.state, state);
        this.state = state;
        if (transition != null) {
            const from = { ...this._attrs };
            this.filterTweenAttrs(from, transition);
            this.tween(from, nextAttrs, transition.duration, transition.easing ?? EASINGS.linear);
        } else {
            this._targetAttrs = this._attrs = nextAttrs;
        }
    }

    render(ctx: DecanRenderingContext) {
        if (this.finalized) {
            return;
        }
        if (this.destroyed) {
            ctx.hitColor = 'transparent';
        } else {
            ctx.hitColor = this.hitColor;
        }
        ctx.save();
        this.def._drawFunc(ctx, this.attrs);
        ctx.restore();
    }

    dispatchEvent(type: string, evt: DecanEvent<Type, Attrs>) {
        const listener = this.def._listeners.find(l => l.event === type);
        listener?.handler(evt);
    }

    destroy() {
        if (!this.destroyed) {
            const state = ':end' as States;
            this.update(state, {});
            this.destroyed = true;
            if (this.currentTween == null) {
                this.finalize();
            }
        }
    }

    private finalize() {
        this.currentAnimations.forEach(a => a.anim.stop());
        this.currentTween?.stop();
        this._finalized = true;
    }

    private filterTweenAttrs(attrs: Partial<Attrs>, tween: ShapeTransition<States, Attrs>) {
        if (tween.exclude == null) {
            return;
        }
        for (const key of tween.exclude) {
            delete attrs[key];
        }
    }

    private tween(from: Attrs, to: Attrs, duration: number, easing: EasingFunction) {
        if (this.currentTween != null) {
            this.currentTween.stop();
        }
        this._sourceAttrs = from;
        this._targetAttrs = to;
        this._tweenDuration = duration * 1000;
        console.log(`Animating to: ${(to as any).lineDashOffset}`);

        const tweenStep = (time: number) => {
            this._attrs = this.dirtyTween(this._sourceAttrs, this._targetAttrs, easing(time / this._tweenDuration));
        }

        this.currentTween = this.animations.animate(tweenStep, duration * 1000, () => {
            this.currentTween = undefined;
            if (this.destroyed) {
                this.finalize();
            }
        }); 

    }

    private dirtyTween(from: any, to: any, progress: number): any {
        for (const attr of Object.keys(to)) {
            const toAttr = to[attr];
            if (toAttr == null) {
                continue;
            }
            const fromAttr = from[attr];
            if (typeof fromAttr === 'number') {
                (this._attrs as any)[attr] = fromAttr + (toAttr - fromAttr) * progress;
            } else {
                (this._attrs as any)[attr] = toAttr;
            }
        }
        return this._attrs;
    }
    
    private computeAttributeSnapshot(state: States, incoming: Partial<Attrs>): Attrs {
        let attrs = { ...this._attrs, ...this._targetAttrs, ...incoming };

        const stateFn = this.def._states[state];
        if (stateFn != null) {
            attrs = { ...attrs, ...stateFn(attrs) };
        }

        return attrs;
    }

    // TODO: Redo this with something smarter. Maybe allow transitions to specify attributes and return all matching transitions
    private findTransition(from: string, to: string): ShapeTransition<States, Attrs> | null {
        // 1: Exact match
        let ret = this.def._transitions.find(t => t.from === from && t.to === to);
        if (ret) {
            return ret;
        }

        // 2: Match to
        ret = this.def._transitions.find(t => t.from == null && t.to === to);
        if (ret) {
            return ret;
        }

        // 2: Match from
        ret = this.def._transitions.find(t => t.to == null && t.from === from);
        if (ret) {
            return ret;
        }

        // 3: Catch all
        ret = this.def._transitions.find(t => t.to == null && t.from == null);
        if (ret) {
            return ret;
        }

        return null;
    }
}