import { createShape, ShapeBuilder } from "./shape";

export const createCircle = <T extends string>(type: T) => createShape(type)
        .attrs({
            radius: 10
        })
        .drawPath((ctx, inst) => {
            ctx.moveTo(0, inst.attrs.radius);
            ctx.beginPath();
            ctx.arc(0, 0, inst.attrs.radius, 0, Math.PI * 2, false);
            ctx.closePath();
        })

export const createSprite = <T extends string>(type: T, imageData?: HTMLImageElement) => {
    return createShape(type)
        .attrs({
            image: imageData
        })
        .render((ctx, s) => {
            s.attrs.image && ctx.drawImage(s.attrs.image, 0, 0);
        });
};
