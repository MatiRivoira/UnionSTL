const userLang = navigator.language || navigator.userLanguage;

document.addEventListener('DOMContentLoaded', function() {
    const divDetalles = document.getElementById('detalleDelPedido');
    const detalles = JSON.parse(localStorage.getItem("detalle-compra"));
    if (detalles) {
        let paquete = detalles.paquete.split('_')[0].toUpperCase();
        let codigo = detalles.codigo;
        if (!codigo) {
            codigo = "Ninguno";
        }
        if (userLang.includes("es")) {
            if (paquete == "IMPRESO") {
                divDetalles.innerHTML = `  
                <ul>
                    <li><strong>Orden ID:</strong> ${detalles.ordenID}</li>
                    <li><strong>Nombre:</strong> ${detalles.nombre}</li>
                    <li><strong>Email:</strong> ${detalles.email}</li>
                    <li><strong>Pais:</strong> ${detalles.pais}</li>
                    <li><strong>Ciudad:</strong> ${detalles.ciudad}</li>
                    <li><strong>Direccion:</strong> ${detalles.direccion}</li>
                    <li><strong>Codigo postal:</strong> ${detalles.cod_postal}</li>
                    <li><strong>Telefono:</strong> ${detalles.telefono}</li>
                    <li><strong>Paquete:</strong> ${paquete}</li>
                    <li><strong>Código promocional:</strong> ${codigo}</li>
                    <li><strong>Descuento:</strong> ${detalles.descuento} USD</li>
                    <li><strong>Precio:</strong> $${detalles.precio} USD</li>
                    <li><strong>Fecha:</strong> ${detalles.hora} </li>
                </ul>`;
            } else {
                divDetalles.innerHTML = `  
                <ul>
                    <li><strong>Orden ID:</strong> ${detalles.ordenID}</li>
                    <li><strong>Nombre:</strong> ${detalles.nombre}</li>
                    <li><strong>Email:</strong> ${detalles.email}</li>
                    <li><strong>Paquete:</strong> ${paquete}</li>
                    <li><strong>Código:</strong> ${codigo}</li>
                    <li><strong>Descuento:</strong> ${detalles.descuento} USD</li>
                    <li><strong>Precio:</strong> $${detalles.precio} USD</li>
                    <li><strong>Fecha:</strong> ${detalles.hora} </li>
                </ul>`;
            }
        } else {
            if (paquete == "IMPRESO") {
                divDetalles.innerHTML = `  
                <ul>
                    <li><strong>Order ID:</strong> ${detalles.ordenID}</li>
                    <li><strong>Name:</strong> ${detalles.nombre}</li>
                    <li><strong>Email:</strong> ${detalles.email}</li>
                    <li><strong>Country:</strong> ${detalles.pais}</li>
                    <li><strong>City:</strong> ${detalles.ciudad}</li>
                    <li><strong>Address:</strong> ${detalles.direccion}</li>
                    <li><strong>Postal Code:</strong> ${detalles.cod_postal}</li>
                    <li><strong>Phone:</strong> ${detalles.telefono}</li>
                    <li><strong>Package:</strong> ${paquete}</li>
                    <li><strong>Promotional Code:</strong> ${codigo}</li>
                    <li><strong>Discount:</strong> ${detalles.descuento} USD</li>
                    <li><strong>Price:</strong> $${detalles.precio} USD</li>
                    <li><strong>Date:</strong> ${detalles.hora} </li>
                </ul>`;
            } else {
                divDetalles.innerHTML = `  
                <ul>
                    <li><strong>Order ID:</strong> ${detalles.ordenID}</li>
                    <li><strong>Name:</strong> ${detalles.nombre}</li>
                    <li><strong>Email:</strong> ${detalles.email}</li>
                    <li><strong>Package:</strong> ${paquete}</li>
                    <li><strong>Code:</strong> ${codigo}</li>
                    <li><strong>Discount:</strong> ${detalles.descuento} USD</li>
                    <li><strong>Price:</strong> $${detalles.precio} USD</li>
                    <li><strong>Date:</strong> ${detalles.hora} </li>
                </ul>`;
            }
            
        }
        if (detalles.estado) {
            document.getElementById("title").innerHTML = "";
        } else {
            guardarPedido(detalles);
        }
    }
});

function guardarPedido(nuevoPedido) {
    // Convertir el nuevo pedido a una cadena JSON
    const nuevoPedidoJSON = JSON.stringify(nuevoPedido);
    // Obtener la lista de pedidos existente del localStorage
    const pedidosExistentes = localStorage.getItem('mis-pedidos');
    if (pedidosExistentes) {
      // Si ya existen pedidos, convertir la cadena almacenada a un arreglo de objetos
        const pedidos = JSON.parse(pedidosExistentes);
      // Verificar si el pedido ya existe
        const pedidoYaExiste = pedidos.some(pedido => JSON.stringify(pedido) === nuevoPedidoJSON);
        if (!pedidoYaExiste) {
            // Si el pedido no existe, agregar el nuevo pedido al arreglo y actualizar el localStorage
            pedidos.push(nuevoPedido);
            localStorage.setItem('mis-pedidos', JSON.stringify(pedidos));
        } else {
            console.log('El pedido ya existe en el almacenamiento.');
        }
    } else {
      // Si no existen pedidos, crear un nuevo arreglo con el pedido actual y guardarlo
        localStorage.setItem('mis-pedidos', JSON.stringify([nuevoPedido]));
    }
}



//* FUNCIONES DE DESCARGA
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

//cargarMonono();
function cargarMonono(){
    limpiarScena();
    const modelos = JSON.parse(`{"cabeza":"cabeza_1","cuerpo":"cuerpo_2","oreja":"oreja_1","ojos":"ojos_5","nariz":"nariz_1","cejas":"cejas_3","pelo":"pelo_38","conjunto":"conjunto_10","lunare":"","delineado":"delineado","zapatilla":"zapatilla_3","mochila":"mochila","arito":"arito_6,arito_7","lente":"lente","gorra":"gorra_6","anillo":"anillo_2","pulsera-iz":"pulsera-iz_1","pulsera-de":"pulsera-de"}`);
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
};

function ponerTextura(nombreModelo, obj) {
    scene.getObjectByName(nombreModelo).material = new THREE.MeshStandardMaterial({
        name: obj,
        map: new THREE.TextureLoader().load("./assets/texturas/baseColor.png"),
        roughnessMap: new THREE.TextureLoader().load(`./assets/texturas/roughness.png`),
        metalnessMap: new THREE.TextureLoader().load(`./assets/texturas/metallic.png`)
    });
}

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
async function descargarStl(scena, nombre) {
    let modeloUnido = null;

    scena.children.forEach(element => {
        if (element.type !== "AmbientLight") {
            if (!modeloUnido) {
                modeloUnido = element;
            } else {
                const meshUnido = crearMeshConMaterial(modeloUnido);
                const meshCsg = CSG.fromMesh(meshUnido);

                const mesh2 = crearMeshConMaterial(element);
                const meshCsg2 = CSG.fromMesh(mesh2);

                const meshUnionCSG = meshCsg.union(meshCsg2.clone());
                modeloUnido = CSG.toMesh(meshUnionCSG, new THREE.Matrix4());
            }
        }
    });

    limpiarScena();
    scene.add(modeloUnido);

    const stlData = exporter.parse(scena, { binary: true });
    descargarArchivo(stlData, `${nombre}.stl`);
}

function crearMeshConMaterial(element) {
    return new THREE.Mesh(
        element.geometry.clone(),
        new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    );
}

function limpiarScena() {
    for (let i = scene.children.length - 1; i > 0; i--) {
        scene.remove(scene.children[i]);
    }
}

function descargarArchivo(data, nombre) {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
}

async function descargarModelos() {
    const cuerpo = {};
    const cabeza = {};

    for (let i = scene.children.length - 1; i > 0; i--) {
        const obj = ((scene.children[i].name).split("_")[0]).split("$")[0];
        if (esParteDelCuerpo(obj)) {
            cuerpo[obj] = scene.children[i];
        } else {
            cabeza[obj] = scene.children[i];
        }
        scene.remove(scene.children[i]);
    }

    await procesarYDescargar(cuerpo, "cuerpo");
    await procesarYDescargar(cabeza, "cabeza");

    restaurarEscena(cuerpo)
    restaurarEscena(cabeza)
}

function esParteDelCuerpo(obj) {
    return [
        "cuerpo", "buzo", "pantalon", "pulsera", "superior", "zapatilla",
        "mano-derecha", "mano-izquierda", "anillo", "conjunto", "mochila",
        "pulsera-de", "pulsera-iz"
    ].includes(obj);
}

async function procesarYDescargar(partes, nombre) {
    for (const key in partes) {
        if (partes[key]) {
            scene.add(partes[key]);
        }
    }
    await descargarStl(scene, nombre);
    limpiarScena();
}

function restaurarEscena(partes) {
    for (const key in partes) {
        if (partes[key]) {
            scene.add(partes[key]);
        }
    }
}

document.getElementById("descargar").addEventListener("click", function () {
    descargarModelos();
});

cargarModelo("../assets/models/cabeza_1.gltf")
//cargarModelo("../assets/models/cejas_1.gltf")
// cargarModelo("../assets/models/cuerpo_1.gltf")
 cargarModelo("../assets/models/pelo_1.gltf")
// cargarModelo("../assets/models/zapatilla_1.gltf")