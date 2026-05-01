import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
    RollerCoasterGeometry,
    RollerCoasterShadowGeometry,
    RollerCoasterLiftersGeometry,
    TreesGeometry,
    SkyGeometry
} from 'three/addons/misc/RollerCoaster.js';
import styles from './Home.module.css';
import AboutMe from '../AboutMe/AboutMe';

const Home = () => {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const [typedText, setTypedText] = useState('');
    const [isSidebarSlid, setIsSidebarSlid] = useState(false);
    const fullText = "I’m a Software Developer who loves creating meaningful products that make an impact. I enjoy working across the full stack, learning new technologies, and continuously improving my craft.";

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) {
                clearInterval(timer);
            }
        }, 40);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const container = canvasRef.current;
        if (!container) return;

        // Prevent double init
        if (rendererRef.current) return;

        let mesh, material, geometry;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);

        // Use window size as fallback if container hasn't been laid out yet
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setSize(w, h);

        // Style the canvas to fill the container
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0ff);

        const light = new THREE.HemisphereLight(0xfff0f0, 0x606060, 3);
        light.position.set(1, 1, 1);
        scene.add(light);

        const train = new THREE.Object3D();
        scene.add(train);

        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
        train.add(camera);

        // environment
        geometry = new THREE.PlaneGeometry(500, 500, 15, 15);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position.array;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 3) {
            vertex.fromArray(positions, i);
            vertex.x += Math.random() * 10 - 5;
            vertex.z += Math.random() * 10 - 5;
            const distance = (vertex.distanceTo(scene.position) / 5) - 25;
            vertex.y = Math.random() * Math.max(0, distance);
            vertex.toArray(positions, i);
        }

        geometry.computeVertexNormals();

        material = new THREE.MeshLambertMaterial({
            color: 0x407000
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        geometry = new TreesGeometry(mesh);
        material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide, vertexColors: true
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        geometry = new SkyGeometry();
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const PI2 = Math.PI * 2;

        const curve = (function () {
            const vector = new THREE.Vector3();
            const vector2 = new THREE.Vector3();

            return {
                getPointAt: function (t) {
                    t = t * PI2;
                    const x = Math.sin(t * 3) * Math.cos(t * 4) * 50;
                    const y = Math.sin(t * 10) * 2 + Math.cos(t * 17) * 2 + 5;
                    const z = Math.sin(t) * Math.sin(t * 4) * 50;
                    return vector.set(x, y, z).multiplyScalar(2);
                },
                getTangentAt: function (t) {
                    const delta = 0.0001;
                    const t1 = Math.max(0, t - delta);
                    const t2 = Math.min(1, t + delta);
                    return vector2.copy(this.getPointAt(t2))
                        .sub(this.getPointAt(t1)).normalize();
                }
            };
        })();

        geometry = new RollerCoasterGeometry(curve, 1500);
        material = new THREE.MeshPhongMaterial({
            vertexColors: true
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        geometry = new RollerCoasterLiftersGeometry(curve, 100);
        material = new THREE.MeshPhongMaterial();
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.1;
        scene.add(mesh);

        geometry = new RollerCoasterShadowGeometry(curve, 500);
        material = new THREE.MeshBasicMaterial({
            color: 0x305000, depthWrite: false, transparent: true
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.1;
        scene.add(mesh);

        const funfairs = [];

        geometry = new THREE.CylinderGeometry(10, 10, 5, 15);
        material = new THREE.MeshLambertMaterial({
            color: 0xff8080
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-80, 10, -70);
        mesh.rotation.x = Math.PI / 2;
        scene.add(mesh);
        funfairs.push(mesh);

        geometry = new THREE.CylinderGeometry(5, 6, 4, 10);
        material = new THREE.MeshLambertMaterial({
            color: 0x8080ff
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(50, 2, 30);
        scene.add(mesh);
        funfairs.push(mesh);

        const position = new THREE.Vector3();
        const tangent = new THREE.Vector3();
        const lookAt = new THREE.Vector3();
        const tangent1 = new THREE.Vector3();
        const tangent2 = new THREE.Vector3();
        const bankQuaternion = new THREE.Quaternion();

        let velocity = 0;
        let progress = 0;
        let prevTime = performance.now();

        function animate() {
            const time = performance.now();
            const delta = time - prevTime;

            for (let i = 0; i < funfairs.length; i++) {
                funfairs[i].rotation.y = time * 0.0004;
            }

            progress += velocity;
            progress = progress % 1;

            position.copy(curve.getPointAt(progress));
            position.y += 0.3;

            train.position.copy(position);
            tangent.copy(curve.getTangentAt(progress));

            velocity -= tangent.y * 0.0000001 * delta;
            velocity = Math.max(0.00004, Math.min(0.0002, velocity));

            const bankDelta = 0.01;
            const t1 = ((progress - bankDelta) % 1 + 1) % 1;
            const t2 = (progress + bankDelta) % 1;

            tangent1.copy(curve.getTangentAt(t1));
            tangent2.copy(curve.getTangentAt(t2));

            let headingChange = Math.atan2(tangent2.x, tangent2.z) - Math.atan2(tangent1.x, tangent1.z);
            if (headingChange > Math.PI) headingChange -= Math.PI * 2;
            if (headingChange < -Math.PI) headingChange += Math.PI * 2;

            train.up.set(0, 1, 0);
            bankQuaternion.setFromAxisAngle(tangent, -Math.atan(headingChange * 8) * 0.5);
            train.up.applyQuaternion(bankQuaternion);

            train.lookAt(lookAt.copy(position).sub(tangent));

            renderer.render(scene, camera);

            prevTime = time;
        }

        renderer.setAnimationLoop(animate);

        function onWindowResize() {
            const cw = container.clientWidth || window.innerWidth;
            const ch = container.clientHeight || window.innerHeight;
            camera.aspect = cw / ch;
            camera.updateProjectionMatrix();
            renderer.setSize(cw, ch);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
        }

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.setAnimationLoop(null);
            renderer.dispose();
            rendererRef.current = null;
        };
    }, []);

    return (
        <div className={styles.appWrapper}>
            <div className={`${styles.leftPattern} ${isSidebarSlid ? styles.leftPatternVisible : ''}`}></div>
            <div className={`${styles.sidebar} ${isSidebarSlid ? styles.sidebarSlid : ''}`}>
                <div className={styles.logo}>:)</div>

                <div className={styles.navTextContainer}>
                    <div className={styles.navItem} onClick={() => setIsSidebarSlid(!isSidebarSlid)}>
                        <div className={styles.navItemLink}>
                            <span className={styles.navItemLinkBottom}>ABOUT ME</span>
                            <span className={styles.navItemLinkTop}>ABOUT ME</span>
                        </div>
                    </div>
                    <div className={styles.navSeparator}></div>
                    <div className={styles.navItem}>
                        <div className={styles.navItemLink}>
                            <span className={styles.navItemLinkBottom}>WORKS</span>
                            <span className={styles.navItemLinkTop}>WORKS</span>
                        </div>
                    </div>
                    <div className={styles.navSeparator}></div>
                    <div className={styles.navItem}>
                        <div className={styles.navItemLink}>
                            <span className={styles.navItemLinkBottom}>SKILLS</span>
                            <span className={styles.navItemLinkTop}>SKILLS</span>
                        </div>
                    </div>
                </div>

                <div className={styles.audioIcon}>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Three.js canvas mounts here */}
                <div ref={canvasRef} className={styles.canvasMount}></div>

                {/* About Me overlay */}
                <AboutMe isVisible={isSidebarSlid} />

                {/* background text effect */}
                <div className={`${styles.backgroundTextOverlay} ${isSidebarSlid ? styles.hiddenWidget : ''}`}>
                    <div className={styles.marqueeContainer} style={{ top: '15%', transform: 'rotate(-3deg)' }}>
                        <div className={styles.marqueeLeft}>
                            <span className={styles.marqueeWord}>{"CODE • BUILD • DEVELOP • DEPLOY • DEBUG • COMPILE • SCRIPT • OPTIMIZE • SHIP • ".repeat(4)}</span>
                            <span className={styles.marqueeWord}>{"CODE • BUILD • DEVELOP • DEPLOY • DEBUG • COMPILE • SCRIPT • OPTIMIZE • SHIP • ".repeat(4)}</span>
                        </div>
                    </div>
                    <div className={styles.marqueeContainer} style={{ top: '70%', transform: 'rotate(2deg)' }}>
                        <div className={styles.marqueeRight}>
                            <span className={styles.marqueeWord}>{"CODE • BUILD • DEVELOP • DEPLOY • DEBUG • COMPILE • SCRIPT • OPTIMIZE • SHIP • ".repeat(4)}</span>
                            <span className={styles.marqueeWord}>{"CODE • BUILD • DEVELOP • DEPLOY • DEBUG • COMPILE • SCRIPT • OPTIMIZE • SHIP • ".repeat(4)}</span>
                        </div>
                    </div>
                </div>

                {/* UI overlay on top */}
                <div className={`${styles.topRightWidget} ${isSidebarSlid ? styles.hiddenWidget : ''}`}>
                   <a href="https://www.youtube.com/channel/UC4_tXw6tK92WbS3g8c8v_2g"className={styles.link} target="_blank"><img src="/Links/linkedin.svg" alt="linkedin" /></a>
                   <a href="https://www.youtube.com/channel/UC4_tXw6tK92WbS3g8c8v_2g"className={styles.link} target="_blank"><img src="/Links/github.svg" alt="github" /></a>
                   <a href="https://www.youtube.com/channel/UC4_tXw6tK92WbS3g8c8v_2g"className={styles.link} target="_blank"><img src="/Links/instagram.svg" alt="instagram" /></a>
                   <a href="https://www.youtube.com/channel/UC4_tXw6tK92WbS3g8c8v_2g"className={styles.link} target="_blank"><img src="/Links/mail.svg" alt="mail" /></a>
                </div>

                <div className={`${styles.heroText} ${isSidebarSlid ? styles.hiddenWidget : ''}`}>
                    <h1 className={styles.heroName}>Sreehari Dileep</h1>
                    <div className={styles.signboardContainer}>
                        <div className={styles.ropes}>
                            <div className={styles.rope}></div>
                            <div className={styles.rope}></div>
                        </div>
                        <div className={styles.signboard}>
                            <p className={styles.heroRole}>Software Developer</p>
                        </div>
                    </div>
                </div>

                <div className={`${styles.bottomLeftWidget} ${isSidebarSlid ? styles.hiddenWidget : ''}`}>
                    <div className={styles.folderItem}>
                        <div className={styles.folderIcon}>
                            <svg className={styles.folderIconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <span className={styles.folderText}>Gallery</span>
                    </div>
                    <div className={styles.folderItem}>
                        <div className={styles.folderIcon}>
                            <svg className={styles.folderIconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
                        </div>
                        <span className={styles.folderText}>Radio</span>
                    </div>
                    <div className={styles.folderItem}>
                        <div className={styles.folderIcon}>
                            <svg className={styles.folderIconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <span className={styles.folderText}>Effect</span>
                    </div>
                    <div className={styles.folderItem}>
                        <div className={styles.folderIcon}>
                            <svg className={styles.folderIconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <span className={styles.folderText}>Resume</span>
                    </div>
                </div>
                <div className={`${styles.bottomRightWidget} ${isSidebarSlid ? styles.hiddenWidget : ''}`}>
                    <p className={styles.cursor}>
                        {typedText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
