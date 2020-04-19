import { Canvas } from "./canvas";
import { Instance } from "./instance";

export interface SceneContext {
    readonly canvas: Canvas;
    readonly hitCanvas: Canvas;
    readonly width: number;
    readonly height: number;
    readonly hitMap: Map<string, Instance<string, unknown>>;
}
