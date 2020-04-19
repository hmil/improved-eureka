/**
 * DeCan stands for DEclarative CANvas.
 *
 * The objective of this library is to offer similar functionality as Konva, but with a declarative API instead of an imperative one.
 *
 * Initial implementation uses Konva under the hood so we don't have to re-implement all of the low-level primitives.
 *
 * Please excuse the mess. Once again, the goal here is to get to some result as fast as possible.
 */


import Konva from 'konva';
import { Tween } from 'konva/types/Tween';

export type ShapeStyle = {
    stroke: string;
    fill: string;
    strokeWidth: number;
}
export type ShapeAttributes = { style: ShapeStyle };
export type DrawFunc<Attrs> = (ctx: Konva.Context, attrs: Attrs) => void;

class Shape<
        Type extends string = never,
        Attrs = {},
        States extends string = 'default' | 'init' | 'end'> {

    public static create<T extends string>(type: T): Shape<T, {}, 'default' | 'init' | 'end'> {
        return new Shape(type, () => {}, {}, {
            default: () => ({}),
            init: () => ({}),
            end: () => ({}),
        }, [], []);
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
            public readonly _listeners: ReadonlyArray<{ event: string, handler: EventHandler }>
    ) { }

    attrs<T extends {}>(attrs: T): Shape<Type, Attrs & T, States> {
        return new Shape(
            this._type,
            this._drawFunc as DrawFunc<Attrs & T>,
            {...this._attrs, ...attrs },
            this._states as { [k in States]: StateFunction<Attrs & T> },
            this._transitions,
            this._listeners);
    }

    draw(drawFunc: DrawFunc<Attrs>): Shape<Type, Attrs, States> {
        return new Shape(this._type, drawFunc, this._attrs, this._states, this._transitions, this._listeners);
    }

    state<S extends string>(state: S, modification: StateFunction<Attrs>): Shape<Type, Attrs, States | S> {
        return new Shape(this._type, this._drawFunc, this._attrs,
            {...this._states, [state]: modification } as { [k in States | S]: StateFunction<Attrs> },
            this._transitions as ReadonlyArray<ShapeTransition<States | S>>,
            this._listeners);
    }

    transition(desc: ShapeTransition<States>): Shape<Type, Attrs, States> {
        return new Shape(this._type, this._drawFunc, this._attrs, this._states, [...this._transitions, desc], this._listeners);
    }

    on(event: EventTypes, handler: EventHandler): Shape<Type, Attrs, States> {
        return new Shape(this._type, this._drawFunc, this._attrs, this._states, this._transitions,
                [...this._listeners, { event, handler }]);
    }

    /* @internal */
    public _draw(ctx: Konva.Context, overrides: Attrs): void {
        return this._drawFunc(ctx, overrides);
    }
}

type AnyShape = Shape<any, any, any>;

type StateFunction<Attrs> = (attrs: Attrs, scene: Scene) => Partial<Attrs>;

type ShapeTransition<States extends string> = {
    from?: States;
    to?: States;
    duration?: number;
};

type EventHandler = (evt: {
    target: ShapeHandle
}) => void;

interface ShapeHandle {
    id: string;
}

type EventTypes = 'mouseenter' | 'mouseleave' | 'click';

export const shape = <T extends string>(type: T) => Shape.create(type);

type Dimentions = {width: number, height: number};

type Filter<S extends AnyShape, Type extends string> = S['_type'] extends Type ? S : never;

class Scene<Shapes extends AnyShape = never> {

    private shapes: Map<string, {shape: Konva.Shape, data: ShapeData<any>}> = new Map();

    public get(id: string) {
        const res = this.shapes.get(id);

        if (res == null) {
            return null;
        }
        return res.shape;
    }

    public static create(dimentions: Dimentions): Scene<never> {
        return new Scene({}, dimentions);
    }

    private constructor(
            private readonly _shapes: { [k in Shapes['_type']]: Filter<Shapes, k>; },
            private readonly _dim: Dimentions,
            private readonly _layer?: Konva.Layer) {
    }

    withShape<S extends AnyShape>(s: S): Scene<Shapes | S> {
        return new Scene({...this._shapes, [s._type]: s }, this._dim);
    }

    dimentions(dim: Dimentions): Scene<Shapes> {
        return new Scene(this._shapes, dim);
    }

    attachTo(e: HTMLElement): Scene<Shapes> {
        const stage = new Konva.Stage({
            container: e as HTMLDivElement,
            width: this._dim.width,
            height: this._dim.height
        });
        const layer = new Konva.Layer();
        stage.add(layer);
        return new Scene(this._shapes, this._dim, layer);
    }

    draw(data: SceneData<Scene<Shapes>>): void {
        if (this._layer == null) {
            console.error('Cannot render before the canvas exists');
            return;
        }

        const newShapes = new Map<string, {shape: Konva.Shape, data: ShapeData<any>, tween?: Tween}>();

        data.data.forEach(d => {
            const old = this.shapes.get(d.id);
            if (old != null) {
                const next = this.updateShape(d, old);
                newShapes.set(d.id, next);
                this.shapes.delete(d.id);
            } else {
                // Create new shape
                const node = this.renderShape(d);
                newShapes.set(d.id, node);
            }
        });

        // Remove old shapes
        for (const old of this.shapes.values()) {
            this.destroyShape(old);
        }

        this.shapes = newShapes;

        this._layer.draw();
    }

    private destroyShape(d: {shape: Konva.Shape, data: ShapeData<any>, tween?: Tween}) {
        const shape = this._shapes[d.data.type as Shapes['_type']];
        const currentStateName = d.data.state || 'default';
        if (shape == null) {
            throw new Error(`Unknown shape type: ${d.data.type}`);
        }

        d.shape.off('mouseleave');
        d.shape.off('mouseenter');

        let transition = shape._transitions.find(t => t.to === 'end');
        if (transition == null) {
            transition = shape._transitions.find(t => t.from == currentStateName && t.to === null);
        }
        if (transition == null) {
            transition = shape._transitions.find(t => t.from == null && t.to == null);
        }

        const attrs = {...d.data.attrs, ...shape._states['end'](d.data.attrs, this) };

        const duration = transition ? transition.duration || 0 : 0;
        if (duration > 0) {
            d.shape.to({
                ...attrs,
                duration,
                easing: Konva.Easings.EaseIn,
                onFinish: () => {
                    d.shape.destroy();
                }
            });
        } else {
            d.shape.destroy();
        }
    }

    private updateShape(d: ShapeData<Shapes>, s: {shape: Konva.Shape, data: ShapeData<any>, tween?: Tween}): {shape: Konva.Shape, data: ShapeData<any>, tween?: Tween} {
        const shape = this._shapes[d.type as Shapes['_type']];
        const currentStateName = d.state || 'default';
        if (shape == null) {
            throw new Error(`Unknown shape type: ${d.type}`);
        }

        const state = shape._states[currentStateName];
        let attrs = {...d.attrs};

        if (state != null) {
            attrs = {...attrs, ...state(attrs, this)};
            if (currentStateName !== s.data.state || this.compare(attrs, s.data.attrs)) {
                if (s.tween) {
                    s.tween.destroy();
                }
                let transition = shape._transitions.find(t => t.to === currentStateName);
                if (transition == null) {
                    transition = shape._transitions.find(t => t.from === s.data.state && t.to == null);
                }
                if (transition == null) {
                    transition = shape._transitions.find(t => t.from == null && t.to == null);
                }
                const tween = new Konva.Tween({
                    node: s.shape,
                    duration: transition ? transition.duration || 0 : 0,
                    easing: Konva.Easings.EaseInOut,
                    ...attrs
                });
                tween.play();

                return { shape: s.shape, data: JSON.parse(JSON.stringify({...d, attrs })), tween};
            }
        }

        return s;
    }

    private compare(t: any, u: any): boolean {
        return JSON.stringify(t) !== JSON.stringify(u);
    }

    private renderShape(d: ShapeData<Shapes>): {shape: Konva.Shape, data: ShapeData<any>, tween: Konva.Tween } {
        const shape = this._shapes[d.type as Shapes['_type']];
        const currentStateName = d.state || 'default';
        if (shape == null) {
            throw new Error(`Unknown shape type: ${d.type}`);
        }

        const state = shape._states[currentStateName];
        let attrs = d.attrs;
        if (state != null) {
            attrs = {...shape._attrs, ...attrs, ...state(attrs, this)};
        }

        let previousAttrs = {...shape.attrs, ...attrs, ...shape._states['init'](attrs, this) };

        let transition = shape._transitions.find(t => t.to === currentStateName);
        if (transition == null) {
            transition = shape._transitions.find(t => t.from === 'init' && t.to == null);
        }
        if (transition == null) {
            transition = shape._transitions.find(t => t.from == null && t.to == null);
        }

        const node = new Konva.Shape({
            state: currentStateName,
            ...previousAttrs,
            sceneFunc: (ctx, s) => {
                shape._draw(ctx, s.attrs);
                ctx.fillStrokeShape(s);
            }
        });

        if (this._layer == null) {
            throw new Error('Layer is not set yet');
        }
        this._layer.add(node);

        const tween = new Konva.Tween({
            node,
            duration: transition ? transition.duration || 0 : 0,
            easing: Konva.Easings.EaseInOut,
            ...attrs
        });
        tween.play();

        shape._listeners.forEach(l => {
            node.on(l.event, () => {
                l.handler({ target: { id: d.id } })
            });
        });

        return { shape: node, data: {...JSON.parse(JSON.stringify(d)), attrs, state: currentStateName}, tween };
    }
}

export type SceneData<S extends Scene> = {
    data: Array<ShapeData<S extends Scene<infer Shapes> ? Shapes: never>>;
}

export type ShapeData<S extends AnyShape> = S extends Shape<infer Type, infer Attrs, infer States> ? ({
    type: Type,
    // If state is omitted, then default to 'init' for new elements and don't change existing elements
    state?: States,
    id: string
} & { attrs: Partial<Attrs>}) : never;

export const scene = (dim: Dimentions) => Scene.create(dim);

export const circle = <T extends string>(type: T) => shape(type)
    .attrs({
        x: 0,
        y: 0,
        radius: 0
    })
    .draw((ctx, attrs) => {
        ctx.moveTo(0, attrs.radius);
        ctx.beginPath();
        ctx.arc(0, 0, attrs.radius, 0, Math.PI * 2, false);
        ctx.closePath();
    });
