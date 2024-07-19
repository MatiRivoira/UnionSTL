import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLExporter } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/exporters/STLExporter.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";     
import { CSG } from './csg.js';

const scene = new THREE.Scene();

// Importacion de meshs
const gltfLoader = new GLTFLoader();
function cargarModelo(url, prueba) {
    gltfLoader.load(url, function (gltf) {
        let parts = url.split('/');
        let nombreModelo = (parts[parts.length - 1]).split('.')[0];
        let model = gltf.scene;
        model.position.set(0, 0.1, 0); 
        model.name = nombreModelo + "Group";
        model.children[0].name = nombreModelo;
        if (prueba) {
            scene.add(model.children[3]);
        } else {
            scene.add(model.children[0]);
        }
        let obj = (nombreModelo.split("_"))[0];
        ponerTextura(nombreModelo, obj);
    },
    function (xhr) {},
    function (error) { alert(error); }
    );
}

function ponerTextura(nombreModelo, obj) {
    scene.getObjectByName(nombreModelo).material = new THREE.MeshStandardMaterial({
        name: obj,
        map: new THREE.TextureLoader().load("./assets/texturas/baseColor.png"),
        roughnessMap: new THREE.TextureLoader().load(`./assets/texturas/roughness.png`),
        metalnessMap: new THREE.TextureLoader().load(`./assets/texturas/metallic.png`)
    });
}


document.getElementById("frmCargarModelo").addEventListener('submit', function(event) {
    event.preventDefault();
    limpiarScena();
    let codigo = document.getElementById("codigoModelo").value;
    document.getElementById("codigoModelo").value = codigo;
    const modelos = JSON.parse(codigo);
    for (let key in modelos) {
        if (modelos.hasOwnProperty(key)) {
            let obj = key.split('_')[0];
            let cuerpo = "";
            let modelo = modelos[key];
            if (modelo.split("$")[0] && modelo != obj) {
                let aux = obj;
                switch (obj) {
                    case "ojos":
                        aux = "ojo";
                        break;
                    case "nariz":
                        aux = "narice";
                        break;
                    case "cejas":
                        aux = "ceja";
                        break;
                    case "pantalon":
                        cuerpo = "/" + modelos["cuerpo"].slice(0, -1) + (parseInt(modelos["cuerpo"].split("_")[1]) - 1) + "/";
                        aux = modelos[key].split("_")[0];
                        break;
                    case "superior":
                        cuerpo = "/" + modelos["cuerpo"].slice(0, -1) + (parseInt(modelos["cuerpo"].split("_")[1]) - 1) + "/";
                        aux = modelos[key].split("_")[0];
                        break;
                    case "conjunto":
                        cuerpo = "/" + modelos["cuerpo"].slice(0, -1) + (parseInt(modelos["cuerpo"].split("_")[1]) - 1) + "/";
                        break;
                    default:
                        cuerpo = "";
                        break;
                }
                if (modelo.split(",").length > 1) {
                    let modelos = modelo.split(",");
                    for (let i = 0; i < modelos.length; i++) {
                        cargarModelo(`../assets/models/${aux}s${cuerpo}/${modelos[i]}.gltf`);
                    }
                } else {
                    cargarModelo(`../assets/models/${aux}s${cuerpo}/${modelo}.gltf`);
                }
            }
        }
    }
});

// Camara
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( 0, -10, 3);

// Render
const container = document.getElementById("container3D");
camera.aspect = 1.0095238095238095;
camera.updateProjectionMatrix();
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.setSize(636, 665.56);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableChangeTarget = false;
controls.enableTilt = false;
controls.minPolarAngle = Math.PI / 5;
controls.maxPolarAngle = Math.PI / 2; 
controls.update();

// Agregar render a div
document.getElementById("container3D").appendChild(renderer.domElement);

//Render the scene
function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Auto size de la scena
window.addEventListener("resize", function () {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspectRatio = width / height;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Luces
var light = new THREE.AmbientLight( 0xffffff );
var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-100, 0, 500);
spotLight.intensity = 0.25; 
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
light.add(spotLight);
var spotLightReverse = new THREE.SpotLight(0xffffff);
spotLightReverse.intensity = 0.25; 
spotLightReverse.position.set(100, 0, -500);
spotLightReverse.castShadow = true;
spotLightReverse.shadow.mapSize.width = 1024;
spotLightReverse.shadow.mapSize.height = 1024;
spotLightReverse.shadow.camera.near = 500;
spotLightReverse.shadow.camera.far = 4000;
spotLightReverse.shadow.camera.fov = 30;
light.add(spotLightReverse);
scene.add(light)

// Iniciar renderizacion 
animate();

const exporter = new STLExporter();
function descargarStl(scena, nombre) {
    let stlData = exporter.parse(scena, { binary: true });
    let blob = new Blob([stlData], { type: 'application/octet-stream' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = url;
    link.download = nombre + '.stl';
    link.click();
}

function unirSTL() {

    cargarModelo("../assets/models/monkey.glb", true); // el true es para la prueba del mono
    //? se agrega un cubo
    const cubeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 2),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
    );
    cubeMesh.position.set(-2, 1.5, -3);
    scene.add(cubeMesh);

    setTimeout(()=>{ //Se utiliza el timeout para que cargue bien el modelo, solo en el caso de la prueba, ya que se carga el modelo directamente en esta funcion.

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xb2ffc8,
            metalness: 0.5,
            roughness: 0.1,
            transparent: true,
            opacity: 0.5,
            //transmission: .9,
            side: THREE.DoubleSide,
            flatShading: true,
        }); // material de prueba

        const cubeCSG = CSG.fromGeometry(
            cubeMesh.geometry.clone().translate(-0.5, 0, 0)
        );

        const mesh = new THREE.Mesh(
            scene.children[2].geometry.clone(),
            new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        ); // se clona la geometria del modelo correspondiente a unir, sacandolo de la escena, se debe hacer con las 2 partes en caso de sacar 2 de la escena.

        const monkeyMeshCSG = CSG.fromMesh(mesh);

        let cubeMonkeyMeshUnion;
        const cubeMonkeyMeshUnionCSG = cubeCSG.union(monkeyMeshCSG.clone()); //aca se une los objetos en ves de cube seria otro modelo de la escena, y luego se guarda simplemente en una const.
        cubeMonkeyMeshUnion = CSG.toMesh(cubeMonkeyMeshUnionCSG, new THREE.Matrix4());
        cubeMonkeyMeshUnion.material = material; //este es un material de ej, se puede extraer el que ya existe o crear uno distinto al que use.
        cubeMonkeyMeshUnion.position.set(3, 1.5, 0); //simplemente lo pone en otra posicion para apreciar el cambio, en el caso del monono deberia quedar en el mismo lugar, y eliminar los modelos despues de unirlo todo.
        scene.add(cubeMonkeyMeshUnion);

        // NOTA
        // en este caso solo se hace con 2 modelos, cuando se carga una cabeza seguramente haya mas de 2, por ende este proceso se tiene que repetir ya que se puede hacer solo de a 2 modelos.
        // para seguir debes usar en este caso cubeMonkeyMeshUnionCSG y este unirlo con otro modelo de la escena, y asi constantemente hasta que no quede ninguno sin unir.
    },500);

    
    
}

function limpiarScena() {
    for (let i = scene.children.length - 1; i > 0; i--) {
        scene.remove(scene.children[i]);
    }
}

function descargarModelos() {
    let cuerpo = { 
        cuerpo: null,
        buzo: null,
        pantalon: null,
        superior: null,
        zapatilla: null
    };
    let cabeza = {
        cabeza: null,
        orejas: null,
        ojos: null,
        nariz: null,
        cejas: null,
        pelo: null
    };
    for (let i = scene.children.length - 1; 0 < i; i--) {
        let obj = ((scene.children[i].name).split("_")[0]).split("$")[0];
        switch (obj) {
            case "cuerpo":
            case "buzo":
            case "pantalon":
            case "pulsera":
            case "superior":
            case "zapatilla":
            case "mano-derecha":
            case "mano-izquierda":
            case "anillo":
            case "conjunto":
            case "mochila":
            case "pulsera-de":
            case "pulsera-iz":
                cuerpo[obj] = scene.children[i];
            break;
            default:
                cabeza[obj] = scene.children[i];
            break;
        }
        scene.remove(scene.children[i]);
    }
    for (let key in cuerpo) {
        if (cuerpo.hasOwnProperty(key)) {
            let group = cuerpo[key];
            if (group) {
            scene.add(group);
            }
        }
    }
    descargarStl(scene, "cuerpo");
    limpiarScena();
    for (let key in cabeza) {
        if (cabeza.hasOwnProperty(key)) {
            let group = cabeza[key];
            if (group) {
                scene.add(group);
            }
        }
    }
    descargarStl(scene, "cabeza");
    for (let key in cuerpo) {
        if (cuerpo.hasOwnProperty(key)) {
            let group = cuerpo[key];
            if (group) {
                scene.add(group);
            }
        }
    }
}

document.getElementById("unirSTL").addEventListener("click", function () {
    unirSTL();
});

document.getElementById("descargarPruebaStl").addEventListener("click", function () {
    descargarStl(scene, "pruebaSTL");
});

document.getElementById("descargarstl").addEventListener("click", function () {
    descargarModelos();
});


document.getElementById("limpiar").addEventListener("click", function () {
    limpiarScena();
});