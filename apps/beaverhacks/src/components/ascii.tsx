import { useRef, useEffect } from "react";
import * as THREE from "three";

import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export const Ascii = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const beaverGroupRef = useRef<THREE.Group | null>(null);
  const rotationGroupRef = useRef<THREE.Group | null>(null);
  const scrollPercent = useRef<number>(0);
  const originalPositions = useRef<Map<THREE.BufferGeometry, Float32Array>>(
    new Map(),
  );
  const explosionProgress = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let effect: AsciiEffect;
    let animationId: number;

    function lerp(x: number, y: number, a: number): number {
      return (1 - a) * x + a * y;
    }

    function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
      return (t: number) => {
        if (t === 0 || t === 1) return t;

        let start = 0;
        let end = 1;
        let mid = t;

        for (let i = 0; i < 10; i++) {
          const x =
            3 * (1 - mid) * (1 - mid) * mid * x1 +
            3 * (1 - mid) * mid * mid * x2 +
            mid * mid * mid;
          if (Math.abs(t - x) < 0.001) break;
          if (x < t) start = mid;
          else end = mid;
          mid = (start + end) / 2;
        }

        return (
          3 * (1 - mid) * (1 - mid) * mid * y1 +
          3 * (1 - mid) * mid * mid * y2 +
          mid * mid * mid
        );
      };
    }

    function scalePercent(start: number, end: number) {
      return (scrollPercent.current - start) / (end - start);
    }

    const animationScripts: { start: number; end: number; func: () => void }[] =
      [];

    animationScripts.push({
      start: 0,
      end: 100,
      func: () => {
        if (rotationGroupRef.current) {
          rotationGroupRef.current.rotation.y = lerp(
            0,
            Math.PI * 1.5,
            scalePercent(0, 100),
          );
        }
      },
    });

    animationScripts.push({
      start: 10,
      end: 80,
      func: () => {
        if (effect && effect.domElement) {
          const fadeProgress = scalePercent(10, 80);
          const easedProgress = 1 - Math.pow(1 - fadeProgress, 2);
          const opacity = lerp(1, 0, easedProgress);
          effect.domElement.style.opacity = opacity.toString();
        }
      },
    });

    function playScrollAnimations() {
      animationScripts.forEach((a) => {
        if (scrollPercent.current >= a.start && scrollPercent.current < a.end) {
          a.func();
        }
      });
    }

    const handleScroll = () => {
      scrollPercent.current =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
          ((document.documentElement.scrollHeight ||
            document.body.scrollHeight) -
            document.documentElement.clientHeight)) *
        100;
    };

    function init() {
      if (!containerRef.current) return;

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
      );
      camera.position.y = 150;
      camera.position.z = 800;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0, 0, 0);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0xffffff, 2, 0, 0);
      pointLight1.position.set(500, 500, 500);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
      pointLight2.position.set(-500, -500, -500);
      scene.add(pointLight2);

      // load SVG logo and extrude it
      const loader = new SVGLoader();
      loader.load("/beaverhacks_white.svg", (data) => {
        const paths = data.paths;
        const group = new THREE.Group();

        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const shapes = SVGLoader.createShapes(path);

          for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 50,
              bevelEnabled: true,
              bevelThickness: 2,
              bevelSize: 2,
              bevelSegments: 5,
            });

            // Store original positions for later
            const positions = geometry.attributes.position.array;
            originalPositions.current.set(
              geometry,
              new Float32Array(positions),
            );

            const mesh = new THREE.Mesh(
              geometry,
              new THREE.MeshPhongMaterial({
                color: path.color || 0xffffff,
                flatShading: true,
              }),
            );
            group.add(mesh);
          }
        }

        group.scale.set(1, -1, 1);

        // calculate bounding box to center the logo after scaling
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        group.position.set(-center.x, -center.y, -center.z);

        // explode vertices randomly
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometry = child.geometry;
            const positions = geometry.attributes.position.array;

            for (let k = 0; k < positions.length; k += 3) {
              positions[k] = positions[k] + (Math.random() - 0.5) * 500; // x
              positions[k + 1] = positions[k + 1] + (Math.random() - 0.5) * 500; // y
              positions[k + 2] = positions[k + 2] + (Math.random() - 0.5) * 500; // z
            }
            geometry.attributes.position.needsUpdate = true;
          }
        });

        // create rotation wrapper at origin
        const rotationGroup = new THREE.Group();
        rotationGroup.add(group);
        scene.add(rotationGroup);

        beaverGroupRef.current = group;
        rotationGroupRef.current = rotationGroup;
      });

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);

      effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true });
      effect.setSize(window.innerWidth, window.innerHeight);
      effect.domElement.style.color = "white";
      effect.domElement.style.backgroundColor = "transparent";

      containerRef.current.appendChild(effect.domElement);

      controls = new OrbitControls(camera, effect.domElement);
      controls.enableRotate = true;
      controls.enableZoom = false;
      controls.enablePan = true;
      controls.rotateSpeed = 0.5;
      controls.panSpeed = 0.3;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      window.addEventListener("resize", onWindowResize);
      window.addEventListener("scroll", handleScroll);
      animate();
    }

    function onWindowResize() {
      if (!camera || !renderer || !effect) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      effect.setSize(window.innerWidth, window.innerHeight);
    }

    const easing = cubicBezier(0.798, 0.005, 0.288, 0.986);

    function animate() {
      animationId = requestAnimationFrame(animate);

      playScrollAnimations();

      // animate vertices collapsing back to original positions
      if (explosionProgress.current < 1 && beaverGroupRef.current) {
        explosionProgress.current += 0.002; // collapse speed
        const easedProgress = easing(explosionProgress.current);

        beaverGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometry = child.geometry;
            const original = originalPositions.current.get(geometry);

            if (original) {
              const positions = geometry.attributes.position.array;
              for (let i = 0; i < positions.length; i++) {
                // lerp directly using eased progress
                positions[i] =
                  original[i] * easedProgress +
                  positions[i] * (1 - easedProgress);
              }
              geometry.attributes.position.needsUpdate = true;
            }
          }
        });
      }

      if (controls) controls.update();
      if (effect && scene && camera) effect.render(scene, camera);
    }

    init();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("scroll", handleScroll);

      if (controls) {
        controls.dispose();
      }

      if (renderer) {
        renderer.dispose();
      }

      if (containerRef.current && effect) {
        containerRef.current.removeChild(effect.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen"></div>;
};
