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
     // create 3 cylinders and union them
     const cylinderMesh1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshStandardMaterial({
            color: 0xffbf00,
        })
    )
    const cylinderMesh2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshStandardMaterial({
            color: 0x00ff00,
        })
    )
    const cylinderMesh3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshStandardMaterial({
            color: 0x9f2b68,
        })
    )
    cylinderMesh1.position.set(1, 0, -6)
    scene.add(cylinderMesh1)
    cylinderMesh2.position.set(3, 0, -6)
    cylinderMesh2.geometry.rotateX(Math.PI / 2)
    scene.add(cylinderMesh2)
    cylinderMesh3.position.set(5, 0, -6)
    cylinderMesh3.geometry.rotateZ(Math.PI / 2)
    scene.add(cylinderMesh3)

    const cylinderCSG1 = CSG.fromMesh(cylinderMesh1, 2)
    const cylinderCSG2 = CSG.fromMesh(cylinderMesh2, 3)
    const cylinderCSG3 = CSG.fromMesh(cylinderMesh3, 4)
    const cylindersUnionCSG = cylinderCSG1.union(
        cylinderCSG2.union(cylinderCSG3)
    )

    const cylindersUnionMesh = CSG.toMesh(
        cylindersUnionCSG,
        new THREE.Matrix4()
    )
    cylindersUnionMesh.material = [
        cylinderMesh1.material,
        cylinderMesh2.material,
        cylinderMesh3.material,
    ]
    cylindersUnionMesh.position.set(2.5, 0, -3)
    scene.add(cylindersUnionMesh)
}

function limpiarScena() {
    for (let i = scene.children.length - 1; i > 0; i--) {
        scene.remove(scene.children[i]);
    }
}

document.getElementById("unirSTL").addEventListener("click", function () {
    unirSTL();
});


document.getElementById("descargarPruebaStl").addEventListener("click", function () {
    descargarStl(scene, "pruebaSTL");
});

document.getElementById("descargarstl").addEventListener("click", function () {
    descargarStl(scene, "modelo");
});


document.getElementById("limpiar").addEventListener("click", function () {
    limpiarScena();
});

