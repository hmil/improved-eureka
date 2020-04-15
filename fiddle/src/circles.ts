import { circle, scene, shape, SceneData, ShapeData } from "./decan";

const width = 800;
const height = 600;

const randomId = (() => {
    let counter = 0;
    return () => String(counter++);
})();

const sceneData: SceneData<typeof myScene> = {
    data: [createRandomCircle()]
};

function createRandomCircle(): ShapeData<typeof node> {
    return {
        id: randomId(),
        type: 'node',
        state: 'default',
        attrs: { x: Math.round(Math.random() * width) , y: Math.round(Math.random() * height), initialRadius: Math.random() * 10 + 10 }
    };
}

const node = circle('node')
    .attrs({
        stroke: '#000',
        strokeWidth: 3,
        initialRadius: 0
    })
    .state('init', () => ({
        radius: 0
    }))
    .state('end', (attrs) => ({
        radius: attrs.initialRadius * 5,
        opacity: 0
    }))
    .state('default', (attrs) => ({
        radius: attrs.initialRadius
    }))
    .state('hover', (attrs) => ({
        radius: attrs.initialRadius * 1.2
    }))
    .transition({
        from: 'init',
        duration: 1,
    })
    .transition({
        from: 'hover',
        duration: 0.5
    })
    .transition({
        duration: 0.2
    })
    .on('mouseenter', (evt) => {
        sceneData.data.find(e => e.id === evt.target.id).state = 'hover';
        myScene.draw(sceneData);
    })
    .on('mouseleave', (evt) => {
        console.log('leave');
        sceneData.data.find(e => e.id === evt.target.id).state = 'default';
        myScene.draw(sceneData);
    })
    .on('click', (evt) => {
        sceneData.data = sceneData.data.filter(e => e.id !== evt.target.id);
        sceneData.data.push(createRandomCircle());
        sceneData.data.push(createRandomCircle());
        myScene.draw(sceneData);
    });

const myScene = scene({ width, height })
    .withShape(node)
    .attachTo(document.getElementById('canvas'));

myScene.draw(sceneData);
