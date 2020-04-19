
/**
 * HTML canvas wrapper.
 * 
 * Handles canvas boilerplate.
 */
export class Canvas {

    private readonly canvas: HTMLCanvasElement;
    public readonly ctx: CanvasRenderingContext2D;
    private readonly pixelRatio: number;

    constructor(width: number, height: number) {
        const canvas = document.createElement('canvas');
        this.pixelRatio = window.devicePixelRatio || 1;
        canvas.width = width * this.pixelRatio;
        canvas.height = height * this.pixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx == null) {
            throw new Error('Canvas is not supported');
        }

        ctx.scale(this.pixelRatio, this.pixelRatio);

        this.canvas = canvas;
        this.ctx = ctx;
    }


    resize(width: number, height: number) {
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {
        this.canvas.addEventListener(type, listener, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void {
        this.canvas.removeEventListener(type, listener, options);
    }

    attachTo(e: HTMLElement) {
        e.appendChild(this.canvas);
    }

    detach() {
        this.canvas.parentElement?.removeChild(this.canvas);
    }
    
    getPixelAt(x: number, y: number): readonly [number, number, number, number] {
        
        return this.ctx.getImageData(x, y, 1, 1).data as any;
    }

    toLocalCoordinates(x: number, y: number): [number, number] {
        const rect = this.canvas.getBoundingClientRect();
        return [
            (x - rect.left) * this.pixelRatio,
            (y - rect.top) * this.pixelRatio
        ];
    }
}
