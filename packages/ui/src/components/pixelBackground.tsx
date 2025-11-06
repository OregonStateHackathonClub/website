"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Define the shader material
const PixelatedBeaverMaterial = shaderMaterial(
  // Uniforms (variables we pass from React to the shader)
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uPixelSize: 6.0,
    uLiquidStrength: 0.12,
    uColor: new THREE.Color('#B19EEF'), // The color tint
  },
  // Vertex Shader (positions vertices)
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (colors pixels)
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uPixelSize;
    uniform float uLiquidStrength;
    uniform vec3 uColor;
    varying vec2 vUv;

    // A simple noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      // Liquid/Wobble effect
      vec2 liquidUv = vUv;
      float liquid = sin(vUv.y * 10.0 + uTime * 3.0) * uLiquidStrength;
      liquidUv.x += liquid;

      // Pixelation
      float resolution = uPixelSize;
      vec2 gridUv = floor(liquidUv * resolution) / resolution;
      
      // Sample the texture at the pixelated, wobbly coordinate
      vec4 textureColor = texture2D(uTexture, gridUv);
      
      // Only show the beaver (not the transparent background)
      if (textureColor.a < 0.5) {
        discard;
      }
      
      // Tint the texture with our color
      gl_FragColor = vec4(uColor, 1.0) * textureColor;
    }
  `
);

// 2. Create the React component for the shader
function PixelScene(props: any) {
  const materialRef = useRef<any>();
  
  // Load your beaver image as a texture
  // Make sure this image is in your /public folder!
  const texture = useTexture('/beaverhacks_white.png');
  
  // Animate the 'uTime' uniform on every frame
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta * props.speed;
      materialRef.current.uLiquidStrength = props.liquidStrength;
      materialRef.current.uPixelSize = props.pixelSize;
      materialRef.current.uColor = new THREE.Color(props.color);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[5, 5]} />
      <PixelatedBeaverMaterial
        ref={materialRef}
        uTexture={texture}
        transparent
      />
    </mesh>
  );
}

// 3. The main Canvas component
export default function PixelatedBeaver(props: any) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <PixelScene {...props} />
    </Canvas>
  );
}