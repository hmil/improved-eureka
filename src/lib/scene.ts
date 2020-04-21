import { SceneBuilder, SceneData } from './dsl/scene-builder';
import { ShapeBuilder } from './dsl/shape-builder';
import { Instance } from './engine/instance';
import { Renderer } from './engine/renderer';
import { ShapeImpl } from './shape';
import { Canvas } from './engine/canvas';
import { SceneContext } from './engine/scene-context';
import { EventsManager } from './engine/events-manager';
import { AnimationManager, AnimationListener } from './engine/animation-manager';

function getRandomColor() {
    var randomColor = ((Math.random() * 0xffffff) << 0).toString(16);
    while (randomColor.length < 6) {
        randomColor = '0' + randomColor;
    }
    return `#${randomColor}`;
}

const W3C_DEFAULT_CANVAS_SIZE: Size = { width: 300, height: 150 };

interface Size {
    width: number;
    height: number;
} 

export class Scene<Shapes extends ShapeBuilder = never> implements SceneBuilder<Shapes>, SceneContext, AnimationListener {

    public static create(): Scene<never> {
        return new Scene(new Map<never, never>(), W3C_DEFAULT_CANVAS_SIZE);
    }

    private instances = new Map<string, Instance>();
    public canvas: Canvas;
    public hitCanvas: Canvas;
    public width: number;
    public height: number;
    public readonly hitMap = new Map<string, Instance<any, any>>();
    private readonly renderer: Renderer;
    private readonly eventsManager = new EventsManager(this);
    private readonly animationManager = new AnimationManager(this);

    private constructor(
            private readonly _shapes: Map<Shapes['type'], Shapes>,
            _dim: Size) {
        this.width = _dim.width;
        this.height = _dim.height;
        this.canvas = new Canvas(_dim.width, _dim.height);
        this.hitCanvas = new Canvas(_dim.width, _dim.height);
        this.renderer = new Renderer(this);
        this.eventsManager.init();
    }

    addShape<S extends ShapeBuilder>(s: S): Scene<Shapes | S> {
        (this._shapes as Map<Shapes['type'] | S['type'], Shapes | S>).set(s.type, s);
        return this;
    }

    size(width: number, height: number): Scene<Shapes> {
        this.width = width;
        this.height = height;
        this.canvas.resize(width, height);
        this.hitCanvas.resize(width, height);
        return this;
    }

    attachTo(e: HTMLElement): Scene<Shapes> {
        this.renderer.attachTo(e);
        return this;
    }

    draw(data: SceneData<SceneBuilder<Shapes>>): void {
        if (this.renderer == null) {
            console.warn('Cannot draw because the scene is not attached to the DOM');
            return;
        }

        const instances = new Map<string, Instance<string, unknown>>();

        data.data.forEach(d => {
            const shape = this._shapes.get(d.type);
            if (shape == null) {
                console.error(`Unknown shape type in data: ${d.type}`);
                return;
            }

            if (!(shape instanceof ShapeImpl)) {
                console.error(`Unexpected shape type: ${shape.constructor.name}`);
                return;
            }

            const previous = this.instances.get(d.id);
            if (previous) {
                // Update existing shape
                this.instances.delete(d.id);
                previous.update(d.state || 'default', d.attrs);
                instances.set(d.id, previous);
            } else {
                // Create new shape
                const instance = new Instance(this.animationManager, d.state || 'default', shape, d.id, d.type, this.generateHitColor(), d.attrs);
                instances.set(d.id, instance);
                this.hitMap.set(instance.hitColor, instance)
            }
        });

        for (const target of this.instances.values()) {
            // Remove previous shape
            this.eventsManager.scheduleEvent('destroyed', target);
            target.destroy();
            this.hitMap.delete(target.hitColor);
            if (!target.finalized) { // Only remove from instances after it has been finalized
                instances.set(target.id, target);
            }
        }
        this.instances = instances;

        this.render();
    }

    private generateHitColor() {
        while (true) {
            const color = getRandomColor();
            if (!this.hitMap.has(color)) {
                return color;
            }
        }
    }

    private render() {
        this.renderer.render(this.instances.values());
        this.eventsManager.flushEvents();
    }

    public onAnimationFrame = () => {
        this.render();
    }
}




