"use client";

import { useState, useEffect, useRef } from "react";
import { Panel } from "./panel";

const PROCESSES = [
  { pid: "1337", name: "hackd", cpu: "12.4", mem: "2.1" },
  { pid: "0042", name: "beaverd", cpu: "8.2", mem: "4.3" },
  { pid: "2026", name: "node", cpu: "5.1", mem: "8.7" },
  { pid: "0517", name: "nginx", cpu: "2.3", mem: "1.2" },
  { pid: "0418", name: "postgres", cpu: "1.8", mem: "12.4" },
];

export const SystemStats = () => {
  const [cpuHistory, setCpuHistory] = useState<number[]>(() =>
    Array(30).fill(25),
  );
  const [cpuUsage, setCpuUsage] = useState(25);
  const [coreUsages, setCoreUsages] = useState([32, 18, 45, 27]);
  const [memUsage, setMemUsage] = useState(42);
  const [swapUsage, setSwapUsage] = useState(12);
  const [diskUsage] = useState(67);
  const [netIn, setNetIn] = useState(124);
  const [netOut, setNetOut] = useState(56);
  const [uptime, setUptime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update CPU
      const newCpu = Math.max(
        5,
        Math.min(95, cpuUsage + (Math.random() - 0.5) * 20),
      );
      setCpuUsage(newCpu);
      setCpuHistory((prev) => [...prev.slice(1), newCpu]);

      // Update core usages
      setCoreUsages((prev) =>
        prev.map((val) =>
          Math.max(
            10,
            Math.min(60, val + Math.floor((Math.random() - 0.5) * 20)),
          ),
        ),
      );

      // Update memory (slower changes)
      setMemUsage((prev) =>
        Math.max(30, Math.min(80, prev + (Math.random() - 0.5) * 5)),
      );
      setSwapUsage((prev) =>
        Math.max(5, Math.min(30, prev + (Math.random() - 0.5) * 3)),
      );

      // Update network
      setNetIn(Math.floor(Math.random() * 500 + 50));
      setNetOut(Math.floor(Math.random() * 200 + 20));

      // Update uptime
      setUptime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cpuUsage]);

  // Draw CPU graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#66440033";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw graph line
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 4;
    ctx.beginPath();

    cpuHistory.forEach((value, index) => {
      const x = (index / (cpuHistory.length - 1)) * width;
      const y = height - (value / 100) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill under the line
    ctx.shadowBlur = 0;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 170, 0, 0.1)";
    ctx.fill();
  }, [cpuHistory]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const ProgressBar = ({
    value,
    max = 100,
    color = "amber",
    showPercent = true,
  }: {
    value: number;
    max?: number;
    color?: "amber" | "green" | "red";
    showPercent?: boolean;
  }) => {
    const percent = (value / max) * 100;
    const colors = {
      amber: "bg-amber-bright",
      green: "bg-green-500",
      red: "bg-red-500",
    };
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-amber-muted/20 overflow-hidden">
          <div
            className={`h-full ${colors[color]} transition-all duration-300`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {showPercent && (
          <span className="text-amber-normal text-[10px] w-8 text-right font-mono">
            {Math.round(percent)}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 h-full font-secondary text-[10px] md:text-xs">
      {/* CPU Panel */}
      <Panel title="CPU" icon="󰻠">
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="w-full h-[60px] border border-amber-muted/20"
          />
          <div className="flex justify-between items-center">
            <span className="text-amber-dim">Usage</span>
            <span className="text-amber-bright font-mono">
              {cpuUsage.toFixed(1)}%
            </span>
          </div>
          <ProgressBar value={cpuUsage} />
          <div className="grid grid-cols-4 gap-1 text-[9px] text-amber-muted">
            {coreUsages.map((usage, core) => (
              <div key={core} className="text-center">
                <div className="text-amber-dim">C{core}</div>
                <div className="text-amber-normal">{usage}%</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Memory Panel */}
      <Panel title="Memory" icon="󰍛">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-amber-dim">RAM</span>
            <span className="text-amber-normal font-mono">
              {((memUsage / 100) * 64).toFixed(1)}K / 64K
            </span>
          </div>
          <ProgressBar value={memUsage} />
          <div className="flex justify-between items-center">
            <span className="text-amber-dim">Swap</span>
            <span className="text-amber-normal font-mono">
              {((swapUsage / 100) * 16).toFixed(1)}K / 16K
            </span>
          </div>
          <ProgressBar value={swapUsage} color="green" />
        </div>
      </Panel>

      {/* Disk Panel */}
      <Panel title="Disk" icon="󰋊">
        <div className="space-y-1">
          <div className="flex justify-between text-amber-dim">
            <span>/dev/sda1</span>
            <span className="text-amber-normal">{diskUsage}%</span>
          </div>
          <ProgressBar value={diskUsage} showPercent={false} />
          <div className="flex justify-between text-[9px] text-amber-muted mt-1">
            <span>134G / 200G</span>
            <span>ext4</span>
          </div>
        </div>
      </Panel>

      {/* Network Panel */}
      <Panel title="Network" icon="󰛳">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-green-500">↓ IN</span>
            <span className="text-amber-normal font-mono">{netIn} KB/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-400">↑ OUT</span>
            <span className="text-amber-normal font-mono">{netOut} KB/s</span>
          </div>
          <div className="text-[9px] text-amber-muted mt-1">
            eth0: 192.168.1.337
          </div>
        </div>
      </Panel>

      {/* Processes Panel */}
      <Panel title="Processes" icon="">
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1 text-[9px] text-amber-dim border-b border-amber-muted/20 pb-1">
            <span>PID</span>
            <span>NAME</span>
            <span>CPU</span>
            <span>MEM</span>
          </div>
          {PROCESSES.map((proc) => (
            <div
              key={proc.pid}
              className="grid grid-cols-4 gap-1 text-[9px] text-amber-muted"
            >
              <span className="text-amber-dim">{proc.pid}</span>
              <span className="text-amber-normal truncate">{proc.name}</span>
              <span>{proc.cpu}%</span>
              <span>{proc.mem}%</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Uptime Panel */}
      <Panel title="System" icon="󰌢">
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-amber-dim">Uptime</span>
            <span className="text-amber-bright font-mono">
              {formatUptime(uptime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-dim">Kernel</span>
            <span className="text-amber-normal">6.9.0-beaver</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-dim">Shell</span>
            <span className="text-amber-normal">bash 5.2</span>
          </div>
        </div>
      </Panel>
    </div>
  );
};
