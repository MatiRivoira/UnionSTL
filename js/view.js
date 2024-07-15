import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLExporter } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/exporters/STLExporter.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";     
import { CSG } from './csg.js';

const scene = new THREE.Scene();

// Importacion de meshs
const gltfLoader = new GLTFLoader();
function cargarModelo(url) {
    gltfLoader.load(url, function (gltf) {
        let parts = url.split('/');
        let nombreModelo = (parts[parts.length - 1]).split('.')[0];
        let model = gltf.scene;
        model.position.set(0, 0.1, 0); 
        model.name = nombreModelo + "Group";
        model.children[0].name = nombreModelo;
        scene.add(model);
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

function Subdividir(mesh) {
    let params = {
        split:          false,
        uvSmooth:       false,
        preserveEdges:  false,
        flatOnly:       false,
        maxTriangles:   124000,
    };
    let geometry = LoopSubdivision.modify(mesh.geometry, 2, params);
    let material = mesh.material.clone();
    let meshSub = new THREE.Mesh(geometry, material);
    meshSub.name = mesh.name;
    meshSub.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
    return meshSub;
}

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
    // Make a box mesh
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshNormalMaterial()
    );
    // make a sphere mesh
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 30, 30));

    // Make sure the .matrix of each mesh is current
    box.updateMatrix();
    sphere.updateMatrix();

    // perform operations on the meshes
    const subRes = CSG.subtract(box, sphere);
    const unionRes = CSG.union(box, sphere);
    const interRes = CSG.intersect(box, sphere);

    // space the meshes out so they don't overlap
    unionRes.position.add(new THREE.Vector3(0, 0, 5));
    interRes.position.add(new THREE.Vector3(0, 0, -5));

    // add the meshes to the scene
    scene.add(subRes, unionRes, interRes);
}

function limpiarScena() {
    for (let i = scene.children.length - 1; i > 0; i--) {
        scene.remove(scene.children[i]);
    }
}

document.getElementById("descargarstl").addEventListener("click", function () {
    unirSTL();
});

document.getElementById("descargarstl").addEventListener("click", function () {
    descargarStl(scene, "modelo");
});


document.getElementById("limpiar").addEventListener("click", function () {
    limpiarScena();
});

