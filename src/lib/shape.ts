
function noop() { }
function identity<T>(i: T) { return i; }
const DEFAULT_STATE = {
    ':begin': identity,
    'default': identity,
    ':end': identity,
};

type DefaultAttrs = {
    strokeStyle?: string | null;
    fillStyle?: string | null;
    globalAlpha?: number;
}

type DrawFunc<Attrs> = (ctx: CanvasRenderingContext2D, attrs: Attrs) => void;
type StateFunction<Attrs> = (attrs: Attrs/*, scene: Scene*/) => Partial<Attrs>;

class Shape<
        Type extends string = never,
        Attrs extends DefaultAttrs = DefaultAttrs,
        States extends string = 'default' | ':begin' | ':end'> implements ShapeBuilder<Type, Attrs, States> {

    public static create<T extends string>(type: T): Shape<T> {
        return new Shape(type, noop, {}, DEFAULT_STATE, [], []);
    }

    private constructor(
            public readonly _type: Type,
            private readonly _drawFunc: DrawFunc<Attrs>,
            /** @internal */
            public readonly _attrs: Attrs,
            /* @internal */
            public readonly _states: { [k in States]: StateFunction<Attrs> },
            /* @internal */
            public readonly _transitions: ReadonlyArray<ShapeTransition<States>>,
            /* @internal */
            public readonly _listeners: ReadonlyArray<{ event: string, handler: EventHandler<Shape<Type, Attrs, States>> }>
    ) { }

    attrs<T extends {}>(attrs: T): Shape<Type, Attrs & T, States> {
        return new Shape(
            this._type,
            this._drawFunc as DrawFunc<Attrs & T>,
            {...this._attrs, ...attrs },
            this._states as { [k in States]: StateFunction<Attrs & T> },
            this._transitions,
            this._listeners as ReadonlyArray<{ event: string, handler: EventHandler<Shape<Type, Attrs & T, States>> }>);
    }

    draw(drawFunc: DrawFunc<Attrs>): Shape<Type, Attrs, States> {
        return new Shape(this._type, drawFunc, this._attrs, this._states, this._transitions, this._listeners);
    }

    state<S extends string>(state: S, modification: StateFunction<Attrs>): Shape<Type, Attrs, States | S>;
    state<S extends string>(state: S, modification: Attrs): Shape<Type, Attrs, States | S>;
    state<S extends string>(state: S, modification: Attrs | StateFunction<Attrs>): Shape<Type, Attrs, States | S> {
        return new Shape(this._type, this._drawFunc, this._attrs,
            {...this._states, [state]: modification } as { [k in States | S]: StateFunction<Attrs> },
            this._transitions as ReadonlyArray<ShapeTransition<States | S>>,
            this._listeners);
    }

    transition(desc: ShapeTransition<States>): Shape<Type, Attrs, States> {
        return new Shape(this._type, this._drawFunc, this._attrs, this._states, [...this._transitions, desc], this._listeners);
    }

    animation(desc: ShapeAnimation<States, Attrs>): Shape<Type, Attrs, States> {
        return this; // TODO
    }

    on(event: EventTypes, handler: EventHandler<this>): Shape<Type, Attrs, States> {
        return new Shape(this._type, this._drawFunc, this._attrs, this._states, this._transitions,
                [...this._listeners, { event, handler }]);
    }

    render(renderFunction: (ctx: CanvasRenderingContext2D, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States> {
        return this; // TODO
    }

    renderHit(renderFunction: (ctx: CanvasRenderingContext2D, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States> {
        return this; // TODO
    }

    drawPath(renderFunction: (ctx: PathRenderingContext, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States> {
        return this; // TODO
    }

    /* @internal */
    public _draw(ctx: CanvasRenderingContext2D, overrides: Attrs): void {
        return this._drawFunc(ctx, overrides);
    }
}

type PathRenderingContext = Pick<CanvasRenderingContext2D, 'arc' | 'arcTo' | 'beginPath' | 'bezierCurveTo' | 'closePath' | 'lineTo' | 'moveTo'>; // TODO: complete this list

export interface ShapeBuilder<
        Type extends string = never,
        Attrs extends DefaultAttrs = DefaultAttrs,
        States extends string = 'default' | ':begin' | ':end'> {

    attrs<T extends {}>(attrs: T): ShapeBuilder<Type, Attrs & T, States>;

    state<S extends string>(state: S, modification: StateFunction<Attrs>): ShapeBuilder<Type, Attrs, States | S>;
    state<S extends string>(state: S, attrs: Partial<Attrs>): ShapeBuilder<Type, Attrs, States | S>;

    transition(desc: ShapeTransition<States>): ShapeBuilder<Type, Attrs, States>;

    animation(desc: ShapeAnimation<States, Attrs>): ShapeBuilder<Type, Attrs, States>;

    on(event: EventTypes, handler: EventHandler<this>): ShapeBuilder<Type, Attrs, States>;

    render(renderFunction: (ctx: CanvasRenderingContext2D, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States>;

    renderHit(renderFunction: (ctx: CanvasRenderingContext2D, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States>;

    drawPath(renderFunction: (ctx: PathRenderingContext, inst: ShapeInstance<this>) => void): ShapeBuilder<Type, Attrs, States>;
}

export type ShapeBuilder2<
        Builder extends ShapeBuilder2<any, any, any>,
        Instance extends any,
        Attrs extends DefaultAttrs> =
    {
        attrs<T extends {}>(attrs: T): ShapeBuilder2<Builder, Instance, Attrs & T>;
    } & Builder;

interface ShapeInstance<Builder> {
    id: string;
    klass: Builder;
    type: Builder extends ShapeBuilder<infer Type, any, any> ? Type : never;
    attrs: Builder extends ShapeBuilder<any, infer Attrs, any> ? Attrs : never;
}

export type { Shape };
export const createShape = <T extends string>(type: T): ShapeBuilder<T> => Shape.create(type);

interface ShapeAnimation<States extends string, Attrs extends DefaultAttrs> {
    states: States | ReadonlyArray<States>;
    animate: (time: number) => Partial<Attrs>;
}

interface ShapeTransition<States extends string> {
    from?: States;
    to?: States;
    duration?: number;
}

type EventTypes = 'mouseenter' | 'mouseleave' | 'click';

type EventHandler<Builder> = (evt: { target: ShapeInstance<Builder> }) => void;
