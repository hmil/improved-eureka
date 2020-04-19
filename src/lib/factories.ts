import { ShapeBuilder } from "./dsl/shape-builder";
import { SceneBuilder } from "./dsl/scene-builder";
import { Scene } from "./scene";
import { ShapeImpl } from "./shape";

export const createShape = <T extends string>(type: T): ShapeBuilder<T> => ShapeImpl.create(type);

export const createCircle = <T extends string>(type: T) => createShape(type)
    .attrs({
        x: 0,
        y: 0,
        radius: 10,
        color: '#000',
        fillColor: 'transparent',
        borderWidth: 1,
    })
    .draw((ctx, attrs) => {
        ctx.strokeStyle = attrs.color;
        ctx.fillStyle = attrs.fillColor;
        ctx.lineWidth = attrs.borderWidth;
        ctx.moveTo(attrs.x, attrs.y + attrs.radius);
        ctx.beginPath();
        ctx.arc(attrs.x, attrs.y, attrs.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    });

export const createScene = (): SceneBuilder<never> => Scene.create();
