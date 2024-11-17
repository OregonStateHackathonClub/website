'use client'

import { useRef, useEffect } from 'react'

interface point {
  char: string;
  x: number;
  y: number;
}

export const GridAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 20;
    const grid: point[] = [];
    const half = (size - 1) / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid.push({
          char: "X",
          x: (x - half) / half,
          y: (y - half) / half
        })
      }
    }

    const width = canvas.width / 2;
    const height = canvas.height / 2;
    
    ctx.strokeStyle = "white"
    ctx.font = "16px Monospace";

    let frame = 0;
    let updates = 0;
    let lastUpdateFrame = 0;

    const s = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
    const lines = [
      " ___                        _   _         _",
      "| - )___ __ _ _ __ __ _ _  | |_| |__ _ __| |_ ___",
      "| - / -_/ _\` \\ / / -_) '_| |  _  / _\` / _| / (_-/",
      "|___\\___\\__,_|\\_/\\___|_|   |_| |_\\__,_\\__|_\\_/__/"
    ]

    const render = () => {
      frame++;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";

      // 150 to 450 out of the 600 x 600 canvas
      for (const point of grid) {

        const dx = (point.x * width * 0.5 + width) - 300
        const dy = (point.y * height * 0.5 + height) - 300

        const dist = Math.sqrt(dx*dx + dy*dy)

        const currAngle = Math.atan2(dy, dx)
        const newAngle = currAngle - Math.pow(dist, 0.5) * frame * 0.0003

        // const rotatedX = point.x * Math.cos(frame * .005 + Math.abs(point.x) + Math.abs(point.y)) - point.y * Math.sin(frame * .005 + Math.abs(point.x) + Math.abs(point.y));
        // const rotatedY = point.x * Math.sin(frame * .005 + Math.abs(point.x) + Math.abs(point.y)) + point.y * Math.cos(frame * .005 + Math.abs(point.x) + Math.abs(point.y));

        // const offsetPoint = {
        //   x: rotatedX * width * 0.5 + width,
        //   y: rotatedY * height * 0.5 + height
        // };

        const offsetPoint2 = {
          x: 300 + Math.cos(newAngle) * dist,
          y: 300 + Math.sin(newAngle) * dist
        }

        ctx.fillText(point.char, Math.round(offsetPoint2.x / 10) * 10, Math.round(offsetPoint2.y / 10) * 10);
      }

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(4, 276, 468, 52);
      ctx.fillStyle = "white";

      // Beaver Hacks ASCII Art: 56 chars long, 468 x 52 px

      // ctx.fillText(" ___                        _   _         _", 66, 276)
      // ctx.fillText("| - )___ __ _ _ __ __ _ _  | |_| |__ _ __| |_ ___", 66, 292)
      // ctx.fillText("| - / -_/ _` \\ / / -_) '_| |  _  / _` / _| / (_-/", 66, 308)
      // ctx.fillText("|___\\___\\__,_|\\_/\\___|_|   |_| |_\\__,_\\__|_\\_/__/", 66, 324)

      if (updates < 20) {
        const framesBetweenUpdates = Math.ceil(1 + (updates / 95) * 10);
        if (frame - lastUpdateFrame >= framesBetweenUpdates) {
          for (let i = 0, n = lines.length; i < n; i++) {
            const chars = lines[i].split("")
            for (let j = 0, n = chars.length; j < n; j++) {
              if (chars[j] == " " || chars[j] == "\n") continue
              const charCode = ((frame + chars[j].charCodeAt(0)) % s.length) + 32
              chars[j] = String.fromCharCode(charCode)
            }
            lines[i] = chars.join("")
            ctx.fillText(lines[i], 66, 276 + i*16)
            updates++
            lastUpdateFrame = frame
          }
          
        }
      }
      for (let i = 0, n = lines.length; i < n; i++) {
        ctx.fillText(lines[i], 66, 276 + i*16)
      }

      requestIdRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [])

  return <canvas ref={canvasRef} width={600} height={600}/>

}
  