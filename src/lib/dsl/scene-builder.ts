import { ShapeBuilder } from "./shape-builder";

export type ShapeData<S extends ShapeBuilder> = S extends ShapeBuilder<infer Type, infer Attrs, infer States> ? ({
    type: Type,
    // If state is omitted, then default to 'init' for new elements and don't change existing elements
    state?: States,
    id: string
} & { attrs: Partial<Attrs>}) : never;

export type SceneData<S extends SceneBuilder<any>> = {
    data: Array<ShapeData<S extends SceneBuilder<infer Shapes> ? Shapes: never>>;
}

export interface SceneBuilder<Shapes extends ShapeBuilder> {
    addShape<S extends ShapeBuilder>(s: S): SceneBuilder<Shapes | S>;

    size(width: number, height: number): SceneBuilder<Shapes>;

    attachTo(e: HTMLElement): SceneBuilder<Shapes>;

    draw(data: SceneData<SceneBuilder<Shapes>>): void;
}
