import { Canvas } from "./canvas";
import { Instance } from "./instance";
import { DecanRenderingContext } from "./rendering-context";
import { EventsManager } from "./events-manager";
import { SceneContext } from "./scene-context";

export class Renderer {


    constructor(private readonly context: SceneContext) { }
    
    public attachTo(root: HTMLElement) {
        this.context.canvas.attachTo(root);
    }

    public render(instances: ReadonlyArray<Instance<any, any>>) {
        const ctx = this.context.canvas.ctx;
        const hitCtx = this.context.hitCanvas.ctx;
        const renderingCtx = new DecanRenderingContext(ctx, hitCtx);
        ctx.clearRect(0, 0, this.context.width, this.context.height);
        hitCtx.clearRect(0, 0, this.context.width, this.context.height);

        instances.forEach(i => {
            i.render(renderingCtx);
        });
    }

    public destroy(): void {
        this.context.canvas.detach();
    }
}