import { SceneData, ShapeData, createCircle, createScene, createShape } from "lib";
import { EASINGS } from "lib/engine/easings";

function randHexByte() {
    return `0${(Math.random() * 0x100).toString(16)}`.substr(-2);
}
function randomColor() {
    return `#${randHexByte()}${randHexByte()}${randHexByte()}`;
}

export function runCirclesSample() {
    const width = 800;
    const height = 600;

    const randomId = (() => {
        let counter = 0;
        return () => String(counter++);
    })();

    const sceneData: SceneData<typeof myScene> = {
        data: [createRandomCircle()]
    };

    // let created = 0;
    // function addCircle() {
    //     sceneData.data.push(createRandomCircle());
    //     myScene.draw(sceneData);
    //     if (created++ < 200) {
    //         setTimeout(addCircle, 1);
    //     }
    // }
    // setTimeout(addCircle, 1);

    function createRandomCircle(): ShapeData<typeof node> {
        return {
            id: randomId(),
            type: 'node',
            state: 'default',
            attrs: { x: Math.round(Math.random() * width), y: Math.round(Math.random() * height), initialRadius: Math.random() * 10 + 10, color: randomColor() }
        };
    }

    const container = document.getElementById('canvas')!;

    const lineDashArray = [0, 0];
    const node = createShape('node')
        .attrs({
            x: 0,
            y: 0,
            radius: 10,
            color: '#000',
            fillColor: 'transparent',
            borderWidth: 1,
            lineDashOffset: 0, // radians
            dashFraction: 1,
            dashLength: 2 * Math.PI / 10 // radians
        })
        .draw((ctx, attrs) => { // TODO: Maybe expose only attrs and not full instance for simpler API
            const x = Math.round(attrs.x);
            const y = Math.round(attrs.y);
            ctx.strokeStyle = attrs.color;
            ctx.fillStyle = attrs.fillColor;
            ctx.lineWidth = attrs.borderWidth;
            if (attrs.dashLength != 0 && attrs.dashFraction != 1) {
                lineDashArray[0] = attrs.dashFraction * attrs.dashLength * attrs.radius;
                lineDashArray[1] = (1 - attrs.dashFraction) * attrs.dashLength * attrs.radius;
                ctx.setLineDash(lineDashArray);
                ctx.lineDashOffset = (attrs.lineDashOffset + attrs.dashLength * attrs.dashFraction / 2) * attrs.radius;
            }
            ctx.moveTo(x, y + attrs.radius);
            ctx.beginPath();
            ctx.arc(x, y, attrs.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        })
        .attrs({
            initialRadius: 0,
            color: '#000',
            borderWidth: 3,
            foobar: 2
        })
        .state(':begin', {
            radius: 1,
        })
        .state(':end', (attrs) => ({
            radius: attrs.initialRadius * 5,
            dashFraction: 0,
        }))
        .state('default', (attrs) => ({
            radius: attrs.initialRadius,
            dashFraction: 1,
        }))
        .state('hover', (attrs) => ({
            borderWidth: 3,
            radius: attrs.initialRadius * 1.2,
            dashFraction: 0.7,
        }))
        .animation({
            states: ['hover', 'default'],
            animate: (time) => ({
                lineDashOffset: time * 2 * Math.PI / 10
            })
        })
        .animation({
            states: ['default'],
            animate: (time) => ({
                borderWidth: Math.sin(time * 2 * Math.PI) * 2 + 3
            })
        })
        .transition({
            from: ':begin',
            duration: 1,
            easing: EASINGS.easeOut
        })
        // .transition({
        //     from: 'hover',
        //     duration: 0.5,
        //     properties: [ 'radius' ],
        // })
        .transition({
            duration: 0.3,
            exclude: [ 'lineDashOffset' ],
            easing: EASINGS.easeInOut
        })
        .transition({
            from: 'hover',
            to: 'default',
            duration: 0.2,
            exclude: [ 'lineDashOffset' ],
            easing: EASINGS.easeInOut
        })
        .transition({
            to: ':end',
            duration: 0.4,
            easing: EASINGS.easeOut
        })
        .on('mouseenter', (evt) => {
            container.style.cursor = 'pointer';
            sceneData.data.find(e => e.id === evt.target.id)!.state = 'hover';
            myScene.draw(sceneData);
        })
        .on('mouseleave', (evt) => {
            container.style.cursor = 'default';
            const elem = sceneData.data.find(e => e.id === evt.target.id);
            if (elem != null) {
                elem.state = 'default';
            }
            myScene.draw(sceneData);
        })
        .on('click', (evt) => {
            sceneData.data = sceneData.data.filter(e => e.id !== evt.target.id);
            sceneData.data.push(createRandomCircle());
            sceneData.data.push(createRandomCircle());
            myScene.draw(sceneData);
        });
    
    const myScene = createScene()
        .size(width, height)
        .addShape(node)
        .attachTo(container);
    
    myScene.draw(sceneData);
}
