import {
    DrawFunc,
    EventHandler,
    EventTypes,
    ShapeAnimation,
    ShapeBuilder,
    ShapeInstance,
    ShapeTransition,
    StateFunction,
} from './dsl/shape-builder';

function noop() { }
function identity<T>(i: T) { return i; }
const DEFAULT_STATE = {
    ':begin': identity,
    'default': identity,
    ':end': identity,
};

export class ShapeImpl<
        Type extends string = never,
        Attrs extends {} = {},
        States extends string = 'default' | ':begin' | ':end'> implements ShapeBuilder<Type, Attrs, States> {

    public static create<T extends string>(type: T): ShapeImpl<T> {
        return new ShapeImpl(type, noop, {}, DEFAULT_STATE, [], [], []);
    }

    private constructor(
            public readonly type: Type,
            /** @internal */
            public readonly _drawFunc: DrawFunc<Attrs>,
            /** @internal */
            public readonly _attrs: Attrs,
            /* @internal */
            public readonly _states: { [k in States]: StateFunction<Attrs> },
            /* @internal */
            public readonly _transitions: ReadonlyArray<ShapeTransition<States, Attrs>>,
            /* @internal */
            public readonly _animations: ReadonlyArray<ShapeAnimation<Type, States, Attrs>>,
            /* @internal */
            public readonly _listeners: ReadonlyArray<{ event: string, handler: EventHandler<Type, Attrs> }>
    ) { }

    attrs<T extends {}>(attrs: T): ShapeImpl<Type, Attrs & T, States> {
        return new ShapeImpl(
            this.type,
            this._drawFunc as DrawFunc<Attrs & T>,
            {...this._attrs, ...attrs },
            this._states as { [k in States]: StateFunction<Attrs & T> },
            this._transitions as ReadonlyArray<ShapeTransition<States, Attrs & T>>,
            this._animations as ReadonlyArray<ShapeAnimation<Type, States, Attrs & T>>,
            this._listeners as ReadonlyArray<{ event: string, handler: EventHandler<Type, Attrs> }>);
    }

    draw(drawFunc: DrawFunc<Attrs>): ShapeImpl<Type, Attrs, States> {
        return new ShapeImpl(this.type, drawFunc, this._attrs, this._states, this._transitions, this._animations, this._listeners);
    }

    state<S extends string>(state: S, modification: StateFunction<Attrs>): ShapeImpl<Type, Attrs, States | S>;
    state<S extends string>(state: S, modification: Attrs): ShapeImpl<Type, Attrs, States | S>;
    state<S extends string>(state: S, modification: Attrs | StateFunction<Attrs>): ShapeImpl<Type, Attrs, States | S> {
        const modifFn = typeof modification === 'function' ? modification : () => modification;
        return new ShapeImpl(this.type, this._drawFunc, this._attrs,
            {...this._states, [state]: modifFn } as { [k in States | S]: StateFunction<Attrs> },
            this._transitions as ReadonlyArray<ShapeTransition<States | S, Attrs>>,
            this._animations,
            this._listeners);
    }

    transition(desc: ShapeTransition<States, Attrs>): ShapeImpl<Type, Attrs, States> {
        return new ShapeImpl(this.type, this._drawFunc, this._attrs, this._states, [...this._transitions, desc], this._animations, this._listeners);
    }

    animation(desc: ShapeAnimation<Type, States, Attrs>): ShapeImpl<Type, Attrs, States> {
        return new ShapeImpl(this.type, this._drawFunc, this._attrs, this._states, this._transitions, [...this._animations, desc], this._listeners);
    }

    on(event: EventTypes, handler: EventHandler<Type, Attrs>): ShapeImpl<Type, Attrs, States> {
        return new ShapeImpl(this.type, this._drawFunc, this._attrs, this._states, this._transitions, this._animations,
                [...this._listeners, { event, handler }]);
    }
}
