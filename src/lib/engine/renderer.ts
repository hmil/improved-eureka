import { Canvas } from "./canvas";
import { Instance } from "./instance";
import { DecanRenderingContext } from "./rendering-context";
import { EventsManager } from "./events-manager";
import { SceneContext } from "./scene-context";

export class Renderer {

    private readonly ctx: CanvasRenderingContext2D;
    private readonly hitCtx: CanvasRenderingContext2D;
    private readonly renderingCtx: DecanRenderingContext;

    constructor(private readonly context: SceneContext) {
        this.ctx = this.context.canvas.ctx;
        this.hitCtx = this.context.hitCanvas.ctx;
        this.renderingCtx = new DecanRenderingContext(this.ctx, this.hitCtx);
    }
    
    public attachTo(root: HTMLElement) {
        this.context.canvas.attachTo(root);
    }

    public render(instances: IterableIterator<Instance>) {
        this.ctx.clearRect(0, 0, this.context.width, this.context.height);
        this.hitCtx.clearRect(0, 0, this.context.width, this.context.height);

        let result = instances.next();
        while (result.done !== true) {
            result.value.render(this.renderingCtx);
            result = instances.next();
        }
    }

    public destroy(): void {
        this.context.canvas.detach();
    }
}