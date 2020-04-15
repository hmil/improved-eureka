

const Node = createShapeClass({
    ...Circle,
    type: 'node',
    fill: '#444',
    transitions: [
        {
            from: 'void',
            begin: {
                radius: 0
            },
            ease: 'ease-out'
        }, {
            to: 'void',
            end: {
                radius: 0
            },
            ease: (t) => t * t
        }, {
            from: '*',
            to: '*',
            ease: 'ease-in-out'
        }
    ]
});

const Connector = createShapeClass({
    type: 'connector',
    attrs: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    },
    shape: (shape, ctx) => {
        const midpoint = (shape.endX - shape.startX) / 2 + shape.startX;
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.bezierCurveTo(midpoint, shape.startY, midpoint, shape.endY, shape.endX, shape.endY);
    },
    stroke: '#ccc',
    states: {
        rest: {
            shape: Circle
        },
        active: {
            animate: (attrs, t) => {
                return {
                    startY: attrs.startY + Math.sin(t / 500)
                };
            }
        }
    },
    transitions: [{
        from: 'void',
        start: {
            complete: 0
        },
        end: {
            complete: 1
        },
        ease: 'ease-out'
    }, {
        to: 'void',
        end: (attrs) => ({
            endY: attrs.endY + 600,
            startY: attrs.startY + 500,
            opacity: 0
        }),
        ease: 'ease-in'
    }, {
        from: '*', to: '*',
        ease: 'ease-in-out'
    }],
    events: {
        click: (evt) => {

        }
    }
});

export const scene = createScene().addShape(Connector).addShape(Node);

scene.render([
    { type: 'node', id: '123', }
]);


