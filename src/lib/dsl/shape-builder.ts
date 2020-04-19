import { EasingFunction } from "lib/engine/easings";

export type DrawFunc<Attrs> = (ctx: CanvasRenderingContext2D, attrs: Attrs) => void;

export type StateFunction<Attrs> = (attrs: Attrs/*, scene: Scene*/) => Partial<Attrs>;

export interface ShapeBuilder<
    Type extends string = any,
    Attrs extends {} = {},
    States extends string = 'default' | ':begin' | ':end'> {

    readonly type: Type;

    attrs<T extends Partial<Attrs>>(attrs: T): ShapeBuilder<Type, Attrs & T, States>;

    state<S extends string>(state: S, modification: StateFunction<Attrs>): ShapeBuilder<Type, Attrs, States | S>;
    state<S extends string>(state: S, attrs: Partial<Attrs>): ShapeBuilder<Type, Attrs, States | S>;

    transition(desc: ShapeTransition<States, Attrs>): ShapeBuilder<Type, Attrs, States>;

    animation(desc: ShapeAnimation<Type, States, Attrs>): ShapeBuilder<Type, Attrs, States>;

    on(event: EventTypes, handler: EventHandler<Type, Attrs>): ShapeBuilder<Type, Attrs, States>;

    draw(drawFunc: DrawFunc<Attrs>): ShapeBuilder<Type, Attrs, States>;
}

export interface ShapeInstance<Type, Attrs> {
    id: string;
    type: Type;
    attrs: Attrs;
}

export interface ShapeAnimation<Type extends string, States extends string, Attrs extends {}> {
    states: States | ReadonlyArray<States>;
    animate: (time: number, inst: ShapeInstance<Type, Attrs>) => Partial<Attrs>;
}

export interface ShapeTransition<States extends string, Attrs> {
    from?: States;
    to?: States;
    duration: number;
    exclude?: Array<keyof Attrs>;
    easing?: EasingFunction;
}

export type EventTypes = 'mouseenter' | 'mouseleave' | 'click';

export interface DecanEvent<Type, Attrs> {
    target: ShapeInstance<Type, Attrs>;
}

export type EventHandler<Type, Attrs> = (evt: DecanEvent<Type, Attrs>) => void;
