export class DecanRenderingContext implements CanvasRenderingContext2D {

    constructor(
            private readonly ctx: CanvasRenderingContext2D,
            private readonly hitCtx: CanvasRenderingContext2D) {
    }

    public get hitColor(): string {
        return this.hitCtx.fillStyle as string;
    }
    public set hitColor(value: string) {
        this.hitCtx.fillStyle = value;
        this.hitCtx.strokeStyle = value;
        this.hitCtx.shadowColor = value;
    }

    get canvas(): HTMLCanvasElement {
        return this.ctx.canvas;
    }

    get direction(): CanvasDirection {
        return this.ctx.direction;
    }
    set direction(value: CanvasDirection) {
        this.ctx.direction = value;
        this.hitCtx.direction = value;
    }

    get fillStyle(): string | CanvasGradient | CanvasPattern {
        return this.ctx.fillStyle;
    }
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
        this.ctx.fillStyle = value;
    }

    get filter(): string {
        return this.ctx.filter;
    }
    set filter(value: string) {
        this.ctx.filter = value;
    }

    get font(): string {
        return this.ctx.font;
    }
    set font(value: string) {
        this.ctx.font = value;
        this.hitCtx.font = value;
    }

    get globalAlpha(): number {
        return this.ctx.globalAlpha;
    }
    set globalAlpha(value: number) {
        this.ctx.globalAlpha = value;
    }

    get globalCompositeOperation(): string {
        return this.ctx.globalCompositeOperation;
    }
    set globalCompositeOperation(value: string) {
        // TODO: some modes will yield weird results with respect to the hit canvas
        this.ctx.globalCompositeOperation = value;
    }

    get imageSmoothingEnabled(): boolean {
        return this.ctx.imageSmoothingEnabled;
    }
    set imageSmoothingEnabled(value: boolean) {
        this.ctx.imageSmoothingEnabled = value;
        this.hitCtx.imageSmoothingEnabled = value;
    }
    
    get imageSmoothingQuality(): ImageSmoothingQuality {
        return this.ctx.imageSmoothingQuality;
    }
    set imageSmoothingQuality(value: ImageSmoothingQuality) {
        this.ctx.imageSmoothingQuality = value;
        this.hitCtx.imageSmoothingQuality = value;
    }

    get lineCap(): CanvasLineCap {
        return this.ctx.lineCap;
    }
    set lineCap(value: CanvasLineCap) {
        this.ctx.lineCap = value;
        this.hitCtx.lineCap = value;
    }

    get lineDashOffset(): number {
        return this.ctx.lineDashOffset;
    }
    set lineDashOffset(value: number) {
        this.ctx.lineDashOffset = value;
        this.hitCtx.lineDashOffset = value;
    }

    get lineJoin(): CanvasLineJoin {
        return this.ctx.lineJoin;
    }
    set lineJoin(value: CanvasLineJoin) {
        this.ctx.lineJoin = value;
        this.hitCtx.lineJoin = value;
    }

    get lineWidth(): number {
        return this.ctx.lineWidth;
    }
    set lineWidth(value: number) {
        this.ctx.lineWidth = value;
        this.hitCtx.lineWidth = value;
    }

    get miterLimit(): number {
        return this.ctx.miterLimit;
    }
    set miterLimit(value: number) {
        this.ctx.miterLimit = value;
        this.hitCtx.miterLimit = value;
    }

    get shadowBlur(): number {
        return this.ctx.shadowBlur;
    }
    set shadowBlur(value: number) {
        this.ctx.shadowBlur = value;
    }

    get shadowColor(): string {
        return this.ctx.shadowColor;
    }
    set shadowColor(value: string) {
        this.ctx.shadowColor = value;
    }

    get shadowOffsetX(): number {
        return this.ctx.shadowOffsetX;
    }
    set shadowOffsetX(value: number) {
        this.ctx.shadowOffsetX = value;
    }

    get shadowOffsetY(): number {
        return this.ctx.shadowOffsetY;
    }
    set shadowOffsetY(value: number) {
        this.ctx.shadowOffsetY = value;
    }

    get strokeStyle(): string | CanvasGradient | CanvasPattern {
        return this.ctx.strokeStyle;
    }
    set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
        this.ctx.strokeStyle = value;
    }

    get textAlign(): CanvasTextAlign {
        return this.ctx.textAlign;
    }
    set textAlign(value: CanvasTextAlign) {
        this.ctx.textAlign = value;
        this.hitCtx.textAlign = value;
    }

    get textBaseline(): CanvasTextBaseline {
        return this.ctx.textBaseline;
    }
    set textBaseline(value: CanvasTextBaseline) {
        this.ctx.textBaseline = value;
    }

    drawImage(image: CanvasImageSource, dx: number, dy: number): void;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: any, sx: any, sy: any, sw?: any, sh?: any, dx?: any, dy?: any, dw?: any, dh?: any) {
        throw new Error("Method not implemented.");
    }
    beginPath(): void {
        this.ctx.beginPath();
        this.hitCtx.beginPath();
    }
    clip(fillRule?: "evenodd" | "nonzero" | undefined): void;
    clip(path: Path2D, fillRule?: "evenodd" | "nonzero" | undefined): void;
    clip(path?: any, fillRule?: any) {
        throw new Error("Method not implemented.");
    }
    fill(fillRule?: "evenodd" | "nonzero" | undefined): void;
    fill(path: Path2D, fillRule?: "evenodd" | "nonzero" | undefined): void;
    fill(path?: any, fillRule?: any) {
        if (path == null) {
            this.ctx.fill();
            this.hitCtx.fill();
        } else if (fillRule == null) {
            this.ctx.fill(path);
            this.hitCtx.fill(path);
        } else {
            this.ctx.fill(path, fillRule);
            this.hitCtx.fill(path, fillRule);
        }
    }
    isPointInPath(x: number, y: number, fillRule?: "evenodd" | "nonzero" | undefined): boolean;
    isPointInPath(path: Path2D, x: number, y: number, fillRule?: "evenodd" | "nonzero" | undefined): boolean;
    isPointInPath(path: any, x: any, y?: any, fillRule?: any): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInStroke(x: number, y: number): boolean;
    isPointInStroke(path: Path2D, x: number, y: number): boolean;
    isPointInStroke(path: any, x: any, y?: any): boolean {
        throw new Error("Method not implemented.");
    }
    stroke(): void;
    stroke(path: Path2D): void;
    stroke(path?: any) {
        if (path != null) {
            this.ctx.stroke(path);
            this.hitCtx.stroke(path);
        } else {
            this.ctx.stroke();
            this.hitCtx.stroke();
        }
    }
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
        throw new Error("Method not implemented.");
    }
    createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null {
        throw new Error("Method not implemented.");
    }
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
        throw new Error("Method not implemented.");
    }
    createImageData(sw: number, sh: number): ImageData;
    createImageData(imagedata: ImageData): ImageData;
    createImageData(sw: any, sh?: any): ImageData {
        throw new Error("Method not implemented.");
    }
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
        throw new Error("Method not implemented.");
    }
    putImageData(imagedata: ImageData, dx: number, dy: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
    putImageData(imagedata: any, dx: any, dy: any, dirtyX?: any, dirtyY?: any, dirtyWidth?: any, dirtyHeight?: any) {
        throw new Error("Method not implemented.");
    }
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.hitCtx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    }
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
        throw new Error("Method not implemented.");
    }
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    closePath(): void {
        this.ctx.closePath();
        this.hitCtx.closePath();
    }
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }
    lineTo(x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    moveTo(x: number, y: number): void {
        this.ctx.moveTo(x, y);
        this.hitCtx.moveTo(x, y);
    }
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    rect(x: number, y: number, w: number, h: number): void {
        throw new Error("Method not implemented.");
    }
    getLineDash(): number[] {
        return this.ctx.getLineDash();
    }
    setLineDash(segments: number[]): void {
        this.ctx.setLineDash(segments);
        this.hitCtx.setLineDash(segments);
    }
    clearRect(x: number, y: number, w: number, h: number): void {
        throw new Error("Method not implemented.");
    }
    fillRect(x: number, y: number, w: number, h: number): void {
        throw new Error("Method not implemented.");
    }
    strokeRect(x: number, y: number, w: number, h: number): void {
        throw new Error("Method not implemented.");
    }
    restore(): void {
        this.ctx.restore();
        this.hitCtx.restore();
    }
    save(): void {
        this.ctx.save();
        this.hitCtx.save();
    }
    fillText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
        throw new Error("Method not implemented.");
    }
    measureText(text: string): TextMetrics {
        throw new Error("Method not implemented.");
    }
    strokeText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
        throw new Error("Method not implemented.");
    }
    getTransform(): DOMMatrix {
        throw new Error("Method not implemented.");
    }
    resetTransform(): void {
        throw new Error("Method not implemented.");
    }
    rotate(angle: number): void {
        throw new Error("Method not implemented.");
    }
    scale(x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    setTransform(transform?: DOMMatrix2DInit | undefined): void;
    setTransform(a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
        throw new Error("Method not implemented.");
    }
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        throw new Error("Method not implemented.");
    }
    translate(x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    drawFocusIfNeeded(element: Element): void;
    drawFocusIfNeeded(path: Path2D, element: Element): void;
    drawFocusIfNeeded(path: any, element?: any) {
        throw new Error("Method not implemented.");
    }
    scrollPathIntoView(): void;
    scrollPathIntoView(path: Path2D): void;
    scrollPathIntoView(path?: any) {
        throw new Error("Method not implemented.");
    }
}