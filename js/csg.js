
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

class CSG {
    constructor() {
        this.polygons = [];
    }
    clone() {
        let csg = new CSG();
        csg.polygons = this.polygons.map((p) => p.clone());
        return csg;
    }
    toPolygons() {
        return this.polygons;
    }
    union(csg) {
        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        return CSG.fromPolygons(a.allPolygons());
    }
    subtract(csg) {
        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a);
        b.invert();
        b.clipTo(a);
        b.invert();
        a.build(b.allPolygons());
        a.invert();
        return CSG.fromPolygons(a.allPolygons());
    }
    intersect(csg) {
        let a = new Node(this.clone().polygons);
        let b = new Node(csg.clone().polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.build(b.allPolygons());
        a.invert();
        return CSG.fromPolygons(a.allPolygons());
    }
    // Devuelve un nuevo CSG sólido con espacio sólido y vacío cambiado. Este sólido es
    // no modificado. 
    inverse() {
        let csg = this.clone();
        csg.polygons.forEach((p) => p.flip());
        return csg;
    }
}
// Construye un sólido CSG a partir de una lista de instancias de `Polygon`.
CSG.fromPolygons = function (polygons) {
    let csg = new CSG();
    csg.polygons = polygons;
    return csg;
};
CSG.fromGeometry = function (geom, objectIndex) {
    let polys = [];
    let posattr = geom.attributes.position;
    let normalattr = geom.attributes.normal;
    let uvattr = geom.attributes.uv;
    let colorattr = geom.attributes.color;
    let index;
    if (geom.index)
        index = geom.index.array;
    else {
        index = new Array((posattr.array.length / posattr.itemSize) | 0);
        for (let i = 0; i < index.length; i++)
            index[i] = i;
    }
    let triCount = (index.length / 3) | 0;
    polys = new Array(triCount);
    for (let i = 0, pli = 0, l = index.length; i < l; i += 3, pli++) {
        let vertices = new Array(3);
        for (let j = 0; j < 3; j++) {
            let vi = index[i + j];
            let vp = vi * 3;
            let vt = vi * 2;
            let x = posattr.array[vp];
            let y = posattr.array[vp + 1];
            let z = posattr.array[vp + 2];
            let nx = normalattr.array[vp];
            let ny = normalattr.array[vp + 1];
            let nz = normalattr.array[vp + 2];
            //let u = uvattr.array[vt]
            //let v = uvattr.array[vt + 1]
            vertices[j] = new Vertex({
                x: x,
                y: y,
                z: z,
            }, {
                x: nx,
                y: ny,
                z: nz,
            }, uvattr &&
                {
                    x: uvattr.array[vt],
                    y: uvattr.array[vt + 1],
                    z: 0,
                }, colorattr &&
                {
                    x: colorattr.array[vt],
                    y: colorattr.array[vt + 1],
                    z: colorattr.array[vt + 2],
                });
        }
        polys[pli] = new Polygon(vertices, objectIndex);
    }
    return CSG.fromPolygons(polys);
};
CSG.ttvv0 = new THREE.Vector3();
CSG.tmpm3 = new THREE.Matrix3();
CSG.fromMesh = function (mesh, objectIndex) {
    let csg = CSG.fromGeometry(mesh.geometry, objectIndex);
    CSG.tmpm3.getNormalMatrix(mesh.matrix);
    for (let i = 0; i < csg.polygons.length; i++) {
        let p = csg.polygons[i];
        for (let j = 0; j < p.vertices.length; j++) {
            let v = p.vertices[j];
            v.pos.copy(CSG.ttvv0
                .copy(new THREE.Vector3(v.pos.x, v.pos.y, v.pos.z))
                .applyMatrix4(mesh.matrix));
            v.normal.copy(CSG.ttvv0
                .copy(new THREE.Vector3(v.normal.x, v.normal.y, v.normal.z))
                .applyMatrix3(CSG.tmpm3));
        }
    }
    return csg;
};
CSG.nbuf3 = (ct) => {
    return {
        top: 0,
        array: new Float32Array(ct),
        write: function (v) {
            this.array[this.top++] = v.x;
            this.array[this.top++] = v.y;
            this.array[this.top++] = v.z;
        },
    };
};
CSG.nbuf2 = (ct) => {
    return {
        top: 0,
        array: new Float32Array(ct),
        write: function (v) {
            this.array[this.top++] = v.x;
            this.array[this.top++] = v.y;
        },
    };
};
CSG.toGeometry = function (csg) {
    let ps = csg.polygons;
    let geom;
    let g2;
    let triCount = 0;
    ps.forEach((p) => (triCount += p.vertices.length - 2));
    geom = new THREE.BufferGeometry();
    let vertices = CSG.nbuf3(triCount * 3 * 3);
    let normals = CSG.nbuf3(triCount * 3 * 3);
    let uvs;
    let colors;
    const grps = {};
    ps.forEach((p) => {
        let pvs = p.vertices;
        let pvlen = pvs.length;
        if (p.shared !== undefined) {
            if (!grps[p.shared])
                grps[p.shared] = [];
        }
        if (pvlen) {
            if (pvs[0].color !== undefined) {
                if (!colors)
                    colors = CSG.nbuf3(triCount * 3 * 3);
            }
            if (pvs[0].uv !== undefined) {
                if (!uvs)
                    uvs = CSG.nbuf2(triCount * 2 * 3);
            }
        }
        for (let j = 3; j <= pvlen; j++) {
            p.shared !== undefined &&
                grps[p.shared].push(vertices.top / 3, vertices.top / 3 + 1, vertices.top / 3 + 2);
            vertices.write(pvs[0].pos);
            vertices.write(pvs[j - 2].pos);
            vertices.write(pvs[j - 1].pos);
            normals.write(pvs[0].normal);
            normals.write(pvs[j - 2].normal);
            normals.write(pvs[j - 1].normal);
            uvs &&
                pvs[0].uv &&
                (uvs.write(pvs[0].uv) || uvs.write(pvs[j - 2].uv) || uvs.write(pvs[j - 1].uv));
            colors &&
                (colors.write(pvs[0].color) ||
                    colors.write(pvs[j - 2].color) ||
                    colors.write(pvs[j - 1].color));
        }
    });
    geom.setAttribute('position', new THREE.BufferAttribute(vertices.array, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals.array, 3));
    uvs && geom.setAttribute('uv', new THREE.BufferAttribute(uvs.array, 2));
    colors && geom.setAttribute('color', new THREE.BufferAttribute(colors.array, 3));
    if (Object.keys(grps).length) {
        let index = [];
        let gbase = 0;
        for (let gi = 0; gi < Object.keys(grps).length; gi++) {
            const key = Number(Object.keys(grps)[gi]);
            geom.addGroup(gbase, grps[key].length, gi);
            gbase += grps[key].length;
            index = index.concat(grps[key]);
        }
        geom.setIndex(index);
    }
    g2 = geom;
    return geom;
};
CSG.toMesh = function (csg, toMatrix, toMaterial) {
    let geom = CSG.toGeometry(csg);
    let inv = new THREE.Matrix4().copy(toMatrix).invert();
    geom.applyMatrix4(inv);
    geom.computeBoundingSphere();
    geom.computeBoundingBox();
    let m = new THREE.Mesh(geom, toMaterial);
    m.matrix.copy(toMatrix);
    m.matrix.decompose(m.position, m.quaternion, m.scale);
    m.rotation.setFromQuaternion(m.quaternion);
    m.updateMatrixWorld();
    m.castShadow = m.receiveShadow = true;
    return m;
};
// # vector de clase
// Representa un vector 3D.
//
// Ejemplo de uso:
//
// nuevo CSG.Vector(1, 2, 3);
class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    clone() {
        return new Vector(this.x, this.y, this.z);
    }
    negate() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
    }
    add(a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this;
    }
    sub(a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        return this;
    }
    times(a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this;
    }
    dividedBy(a) {
        this.x /= a;
        this.y /= a;
        this.z /= a;
        return this;
    }
    lerp(a, t) {
        return this.add(Vector.tv0.copy(a).sub(this).times(t));
    }
    unit() {
        return this.dividedBy(this.length());
    }
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }
    normalize() {
        return this.unit();
    }
    cross(b) {
        let a = this;
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }
    dot(b) {
        return this.x * b.x + this.y * b.y + this.z * b.z;
    }
}

//Temporales utilizados para evitar la asignación interna.
Vector.tv0 = new Vector();
Vector.tv1 = new Vector();
// # clase Vértice
// Representa un vértice de un polígono. Utilice su propia clase de vértice en lugar de esta
// uno para proporcionar características adicionales como coordenadas de textura y vértices
// colores. Las clases de vértices personalizadas deben proporcionar una propiedad `pos` y `clone()`,
// métodos `flip()` e `interpolate()` que se comportan de forma análoga a los
// definido por `CSG.Vertex`. Esta clase proporciona comodidad "normal".
// funciones como `CSG.sphere()` pueden devolver un vértice suave normal, pero `normal`
// no se usa en ningún otro lugar.
class Vertex {
    constructor(pos, normal, uv, color) {
        this.pos = new Vector().copy(pos);
        this.normal = new Vector().copy(normal);
        uv && (this.uv = new Vector().copy(uv)) && (this.uv.z = 0);
        color && (this.color = new Vector().copy(color));
    }
    clone() {
        return new Vertex(this.pos, this.normal, this.uv, this.color);
    }
    // Invertir todos los datos específicos de la orientación (por ejemplo, vértice normal). Llamado cuando el
    // se invierte la orientación de un polígono.
    flip() {
        this.normal.negate();
    }
    // Crea un nuevo vértice entre este vértice y `otro` linealmente
    // interpolando todas las propiedades usando un parámetro de `t`. Las subclases deberían
    // anula esto para interpolar propiedades adicionales.
    interpolate(other, t) {
        return new Vertex(this.pos.clone().lerp(other.pos, t), this.normal.clone().lerp(other.normal, t), this.uv && other.uv && this.uv.clone().lerp(other.uv, t), this.color && other.color && this.color.clone().lerp(other.color, t));
    }
}
// # clase Plano
// Representa un plano en el espacio 3D.
class Plane {
    constructor(normal, w) {
        this.normal = normal;
        this.w = w;
    }
    clone() {
        return new Plane(this.normal.clone(), this.w);
    }
    flip() {
        this.normal.negate();
        this.w = -this.w;
    }
    // Divide `polígono` por este plano si es necesario, luego coloca el polígono o polígono
    // fragmentos en las listas apropiadas. Los polígonos coplanares entran en cualquiera de los dos
    // `coplanarFront` o `coplanarBack` dependiendo de su orientación con
    // respecto a este plano. Los polígonos delante o detrás de este plano entran en
    // ya sea `frontal` o `posterior`.
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
        const COPLANAR = 0;
        const FRONT = 1;
        const BACK = 2;
        const SPANNING = 3;
        // Clasifica cada punto así como el polígono completo en uno de los anteriores
        // cuatro clases.
        let polygonType = 0;
        let types = [];
        for (let i = 0; i < polygon.vertices.length; i++) {
            let t = this.normal.dot(polygon.vertices[i].pos) - this.w;
            let type = t < -Plane.EPSILON ? BACK : t > Plane.EPSILON ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }
        // Coloca el polígono en la lista correcta, dividiéndolo cuando sea necesario.
        switch (polygonType) {
            case COPLANAR:
                ;
                (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
                break;
            case FRONT:
                front.push(polygon);
                break;
            case BACK:
                back.push(polygon);
                break;
            case SPANNING:
                let f = [], b = [];
                for (let i = 0; i < polygon.vertices.length; i++) {
                    let j = (i + 1) % polygon.vertices.length;
                    let ti = types[i], tj = types[j];
                    let vi = polygon.vertices[i], vj = polygon.vertices[j];
                    if (ti != BACK)
                        f.push(vi);
                    if (ti != FRONT)
                        b.push(ti != BACK ? vi.clone() : vi);
                    if ((ti | tj) == SPANNING) {
                        let t = (this.w - this.normal.dot(vi.pos)) /
                            this.normal.dot(Vector.tv0.copy(vj.pos).sub(vi.pos));
                        let v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v.clone());
                    }
                }
                if (f.length >= 3)
                    front.push(new Polygon(f, polygon.shared));
                if (b.length >= 3)
                    back.push(new Polygon(b, polygon.shared));
                break;
        }
    }
}
// `Plane.EPSILON` es la tolerancia utilizada por `splitPolygon()` para decidir si un
// el punto está en el plano.
Plane.EPSILON = 1e-5;
Plane.fromPoints = function (a, b, c) {
    let n = Vector.tv0.copy(b).sub(a).cross(Vector.tv1.copy(c).sub(a)).normalize();
    return new Plane(n.clone(), n.dot(a));
};
// # clase polígono
// Representa un polígono convexo. Los vértices utilizados para inicializar un polígono deben
// ser coplanar y formar un bucle convexo. No tienen que ser `Vertex`
// instancias, pero deben comportarse de manera similar (se puede usar el tipo pato para
// personalización).
//
// Cada polígono convexo tiene una propiedad "compartida", que se comparte entre todos
// polígonos que son clones entre sí o que se dividieron del mismo polígono.
// Esto se puede utilizar para definir propiedades por polígono (como el color de la superficie).
class Polygon {
    constructor(vertices, shared) {
        this.vertices = vertices;
        this.shared = shared;
        this.plane = Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }
    clone() {
        return new Polygon(this.vertices.map((v) => v.clone()), this.shared);
    }
    flip() {
        this.vertices.reverse().forEach((v) => v.flip());
        this.plane.flip();
    }
}
// # clase Nodo
// Mantiene un nodo en un árbol BSP. Un árbol BSP se construye a partir de una colección de polígonos.
// eligiendo un polígono para dividirlo. Ese polígono (y todos los demás coplanares)
// polígonos) se agregan directamente a ese nodo y los otros polígonos se agregan a
// los subárboles delantero y/o trasero. Este no es un árbol BSP frondoso ya que hay
// no hay distinción entre nodos internos y hoja.
class Node {
    constructor(polygons) {
        this.polygons = [];
        if (polygons)
            this.build(polygons);
    }
    clone() {
        let node = new Node();
        node.plane = this.plane && this.plane.clone();
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();
        node.polygons = this.polygons.map((p) => p.clone());
        return node;
    }
    // Convierte espacio sólido en espacio vacío y espacio vacío en espacio sólido.
    invert() {
        for (let i = 0; i < this.polygons.length; i++)
            this.polygons[i].flip();
        this.plane && this.plane.flip();
        this.front && this.front.invert();
        this.back && this.back.invert();
        let temp = this.front;
        this.front = this.back;
        this.back = temp;
    }
    // Elimina recursivamente todos los polígonos en `polígonos` que están dentro de este BSP
    // árbol.
    clipPolygons(polygons) {
        if (!this.plane)
            return polygons.slice();
        let front = [], back = [];
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], front, back, front, back);
        }
        if (this.front)
            front = this.front.clipPolygons(front);
        if (this.back)
            back = this.back.clipPolygons(back);
        else
            back = [];
        //return front;
        return front.concat(back);
    }
    // Elimina todos los polígonos de este árbol BSP que están dentro del otro árbol BSP
    // `bsp`.
    clipTo(bsp) {
        this.polygons = bsp.clipPolygons(this.polygons);
        if (this.front)
            this.front.clipTo(bsp);
        if (this.back)
            this.back.clipTo(bsp);
    }
    // Devuelve una lista de todos los polígonos de este árbol BSP.
    allPolygons() {
        let polygons = this.polygons.slice();
        if (this.front)
            polygons = polygons.concat(this.front.allPolygons());
        if (this.back)
            polygons = polygons.concat(this.back.allPolygons());
        return polygons;
    }
    // Construye un árbol BSP a partir de "polígonos". Cuando se llama a un árbol existente, el
    // los nuevos polígonos se filtran hasta la parte inferior del árbol y se vuelven nuevos
    // nodos allí. Cada conjunto de polígonos se divide utilizando el primer polígono.
    // (no se utiliza ninguna heurística para elegir una buena división).
    build(polygons) {
        if (!polygons.length)
            return;
        if (!this.plane)
            this.plane = polygons[0].plane.clone();
        let front = [], back = [];
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }
        if (front.length) {
            if (!this.front)
                this.front = new Node();
            this.front.build(front);
        }
        if (back.length) {
            if (!this.back)
                this.back = new Node();
            this.back.build(back);
        }
    }
}
Node.fromJSON = function (json) {
    return CSG.fromPolygons(json.polygons.map((p) => new Polygon(p.vertices.map((v) => new Vertex(v.pos, v.normal, v.uv)), p.shared)));
};
export { CSG, Vertex, Vector, Polygon, Plane };
// Devuelve un nuevo sólido CSG que representa el espacio en este sólido o en el
// sólido `csg`. Ni este sólido ni el sólido `csg` se modifican.
//
//     A.union(B)
//
//     +-------+            +-------+
//     |       |            |       |
//     |   A   |            |       |
//     |    +--+----+   =   |       +----+
//     +----+--+    |       +----+       |
//          |   B   |            |       |
//          |       |            |       |
//          +-------+            +-------+
//
// Devuelve un nuevo sólido CSG que representa el espacio en este sólido pero no en el
// sólido `csg`. Ni este sólido ni el sólido `csg` se modifican.
//
//     A.subtract(B)
//
//     +-------+            +-------+
//     |       |            |       |
//     |   A   |            |       |
//     |    +--+----+   =   |    +--+
//     +----+--+    |       +----+
//          |   B   |
//          |       |
//          +-------+
//
// Devuelve un nuevo sólido CSG que representa el espacio tanto en este sólido como en el
// sólido `csg`. Ni este sólido ni el sólido `csg` se modifican.
//
//     A.intersect(B)
//
//     +-------+
//     |       |
//     |   A   |
//     |    +--+----+   =   +--+
//     +----+--+    |       +--+
//          |   B   |
//          |       |
//          +-------+
//