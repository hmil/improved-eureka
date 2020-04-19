import { Instance } from './instance';
import { SceneContext } from './scene-context';

function toHex(rgb: ReadonlyArray<number>): string {
    return '#' + `00000${(rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16)}`.substr(-6);
}

export class EventsManager {

    private currentMousedOverInstance?: Instance<string, unknown>;
    private eventBuffer: Array<{type: string, target: Instance}> = [];

    constructor(private readonly context: SceneContext) {
    }

    public init() {
        window.addEventListener('mousemove', this.onMouseMove);
        this.context.canvas.addEventListener('click', this.onClick);
    }

    private onMouseMove = (evt: MouseEvent) => {
        const color = this.context.hitCanvas.getPixelAt(...this.context.canvas.toLocalCoordinates(evt.clientX, evt.clientY));
        if (color[3] === 0) {
            this.onMouseOut();
            return;
        }
        const target = this.context.hitMap.get(toHex(color));
        if (target == null) {
            this.onMouseOut();
            return;
        }

        if (this.currentMousedOverInstance != null && this.currentMousedOverInstance.id !== target.id) {
            this.onMouseOut();
        }
        if (this.currentMousedOverInstance?.id != target.id) {
            target.dispatchEvent('mouseenter', { target });
        }
        this.currentMousedOverInstance = target;
    }

    private onClick = (evt: MouseEvent) => {
        const color = this.context.hitCanvas.getPixelAt(...this.context.canvas.toLocalCoordinates(evt.clientX, evt.clientY));
        if (color[3] === 0) {
            return;
        }
        const target = this.context.hitMap.get(toHex(color));
        if (target == null) {
            return;
        }

        target.dispatchEvent('click', { target });
    }

    private onMouseOut() {
        if (this.currentMousedOverInstance != null) {
            this.currentMousedOverInstance.dispatchEvent('mouseleave', { target: this.currentMousedOverInstance });
            this.currentMousedOverInstance = undefined;
        }
    }

    public destroy(): void {
        this.context.canvas.removeEventListener('click', this.onClick);
        window.removeEventListener('mousemove', this.onMouseMove);
    }

    public scheduleEvent(type: string, target: Instance<string, unknown>) {
        this.eventBuffer.push({ type, target });
    }

    public flushEvents() {
        const buffer = this.eventBuffer;
        this.eventBuffer = [];
        buffer.forEach(e => {
            e.target.dispatchEvent(e.type, e);
        });
    }
}
