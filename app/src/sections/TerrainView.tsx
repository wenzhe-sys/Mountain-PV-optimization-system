import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Html,
  Line,
  Sparkles,
  Billboard,
  Text,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sun,
  Mountain,
  Ruler,
  Download,
  Upload,
  Pin,
  RotateCcw,
  Info,
  FileText,
  Compass,
  ChevronDown,
  Wind as WindIcon,
  Sparkle,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Map as MapIcon,
  Grid3X3,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import siteSelectionService from '../services/siteSelectionService';

// ============================================================================
// 地形数据生成 (FBM 噪声 + 山脊噪声)
// ============================================================================

// 2D hash (稳定伪随机)
function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

// 平滑 value noise
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // quintic smoothstep (比 cubic 更平滑)
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);

  return (
    a * (1 - u) * (1 - v) +
    b * u * (1 - v) +
    c * (1 - u) * v +
    d * u * v
  );
}

// 分形布朗运动 (FBM)
function fbm(x: number, y: number, octaves = 6, lacunarity = 2.0, gain = 0.5): number {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    maxAmp += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / maxAmp;
}

// 山脊噪声 (产生更尖锐的山脊)
function ridgeNoise(x: number, y: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    let n = valueNoise(x * freq, y * freq);
    n = 1 - Math.abs(n * 2 - 1);
    n = n * n;
    sum += n * amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

// 共享的 per-cell 派生属性计算（消除 generateTerrainData 与 convertBackendTerrain 的重复）
type CellDerived = {
  soilType: number;
  terrainType: number;
  vegetation: number;
  windSpeed: number;
  temperature: number;
  rainfall: number;
  suitability: number;
};

function computeCellDerived(
  elev: number, slopeDeg: number, asp: number,
  solarRad: number, minH: number, i: number, j: number, size: number
): CellDerived {
  let soil: number;
  if (elev < minH + 5) soil = 0;
  else if (elev < minH + 18) soil = 1;
  else if (slopeDeg > 20) soil = 2;
  else soil = 3;

  let terrain: number;
  if (elev < minH + 8) terrain = 0;
  else if (elev < minH + 20) terrain = 1;
  else if (elev < minH + 35) terrain = 2;
  else terrain = 3;

  const vegBase = Math.max(0, 1 - slopeDeg / 40);
  const vegHeight = Math.max(0, 1 - Math.abs(elev - (minH + 15)) / 30);
  const veg = Math.min(1, vegBase * 0.6 + vegHeight * 0.4);

  const aspectFactor = 0.5 + 0.5 * Math.cos(((asp - 180) * Math.PI) / 180);
  let score = 100;
  if (slopeDeg > 25) score -= (slopeDeg - 25) * 2.5;
  else if (slopeDeg > 15) score -= (slopeDeg - 15) * 1.2;
  if (elev > minH + 45) score -= (elev - minH - 45) * 1.5;
  score += (solarRad - 600) / 12;
  if (veg > 0.8) score -= (veg - 0.8) * 40;
  if (soil === 2) score -= 15;
  if (aspectFactor > 0.7) score += 8;

  return {
    soilType: soil,
    terrainType: terrain,
    vegetation: veg,
    windSpeed: 4 + (elev - minH) / 6,
    temperature: 22 - (elev - minH) / 12,
    rainfall: 800 + Math.sin((i / size) * Math.PI * 2) * 120 + Math.cos((j / size) * Math.PI * 2) * 80,
    suitability: Math.max(0, Math.min(100, score)),
  };
}

type TerrainData = {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
  soilType: number[][];
  terrainType: number[][];
  aspect: number[][];
  vegetation: number[][];
  windSpeed: number[][];
  temperature: number[][];
  rainfall: number[][];
  suitability: number[][];
  minH: number;
  maxH: number;
};

function generateTerrainData(size = 96): TerrainData {
  const elevation: number[][] = [];
  const slope: number[][] = [];
  const solarRadiation: number[][] = [];
  const soilType: number[][] = [];
  const terrainType: number[][] = [];
  const aspect: number[][] = [];
  const vegetation: number[][] = [];
  const windSpeed: number[][] = [];
  const temperature: number[][] = [];
  const rainfall: number[][] = [];
  const suitability: number[][] = [];

  for (let i = 0; i < size; i++) {
    elevation[i] = new Array(size);
    slope[i] = new Array(size);
    solarRadiation[i] = new Array(size);
    soilType[i] = new Array(size);
    terrainType[i] = new Array(size);
    aspect[i] = new Array(size);
    vegetation[i] = new Array(size);
    windSpeed[i] = new Array(size);
    temperature[i] = new Array(size);
    rainfall[i] = new Array(size);
    suitability[i] = new Array(size);
  }

  let minH = Infinity;
  let maxH = -Infinity;

  // ===== 第一轮: 生成海拔 =====
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = (i / size) * 4;
      const y = (j / size) * 4;

      // 大尺度地形基底 (低频 FBM)
      const base = fbm(x * 0.6, y * 0.6, 4, 2.0, 0.55) * 30;

      // 山脊 (产生山脉)
      const ridge = ridgeNoise(x * 0.8 + 10, y * 0.8 + 5, 5) * 22;

      // 中尺度细节
      const mid = fbm(x * 1.5, y * 1.5, 4, 2.2, 0.5) * 8;

      // 高频细节 (小石块、沟壑)
      const detail = fbm(x * 4, y * 4, 3, 2.0, 0.45) * 2.5;

      // 径向衰减 (让地形中间更高，边缘更低)
      const cx = size * 0.5;
      const cy = size * 0.5;
      const dx = (i - cx) / (size * 0.5);
      const dy = (j - cy) / (size * 0.5);
      const r = Math.sqrt(dx * dx + dy * dy);
      const radialFalloff = Math.max(0, 1 - Math.pow(Math.min(r, 1), 1.8));

      let h = (base * 0.5 + ridge * 0.8 + mid * 0.4 + detail) * radialFalloff;

      // 基础海拔 (山地基线 ~1200m 以上)
      h = Math.max(0, h) + 12;

      // 制造更多平台 (适合光伏的区域) - 放宽范围
      if (h > 18 && h < 38) {
        const platNoise = fbm(x * 0.3 + 100, y * 0.3 + 100, 2, 2, 0.5);
        if (platNoise > 0.45) {
          const center = (18 + 38) / 2;
          h = center + (h - center) * 0.25; // 压平
        }
      }

      elevation[i][j] = h;
      if (h < minH) minH = h;
      if (h > maxH) maxH = h;
    }
  }

  // ===== 第二轮: 坡度、坡向、派生属性 =====
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // 使用中心差分计算坡度 (更精确)
      const hL = i > 0 ? elevation[i - 1][j] : elevation[i][j];
      const hR = i < size - 1 ? elevation[i + 1][j] : elevation[i][j];
      const hD = j > 0 ? elevation[i][j - 1] : elevation[i][j];
      const hU = j < size - 1 ? elevation[i][j + 1] : elevation[i][j];

      const dzdx = (hR - hL) / 2;
      const dzdy = (hU - hD) / 2;
      const gradMag = Math.sqrt(dzdx * dzdx + dzdy * dzdy);
      const slopeDeg = Math.atan(gradMag) * 180 / Math.PI;
      slope[i][j] = slopeDeg;

      let asp = Math.atan2(-dzdx, dzdy) * 180 / Math.PI;
      if (asp < 0) asp += 360;
      aspect[i][j] = asp;

      const elev = elevation[i][j];

      // 太阳辐射: 坡度越小越好, 南向(180度)最好
      const aspectFactor = 0.5 + 0.5 * Math.cos(((asp - 180) * Math.PI) / 180);
      const slopeFactor = Math.max(0.4, 1 - slopeDeg / 60);
      const elevFactor = Math.min(1.15, 1 + (elev - minH) / 200);
      solarRadiation[i][j] = 1100 * aspectFactor * slopeFactor * elevFactor;

      // 使用共享函数计算派生属性
      const derived = computeCellDerived(elev, slopeDeg, asp, solarRadiation[i][j], minH, i, j, size);
      soilType[i][j] = derived.soilType;
      terrainType[i][j] = derived.terrainType;
      vegetation[i][j] = derived.vegetation;
      windSpeed[i][j] = derived.windSpeed;
      temperature[i][j] = derived.temperature;
      rainfall[i][j] = derived.rainfall;
      suitability[i][j] = derived.suitability;
    }
  }

  return {
    elevation,
    slope,
    solarRadiation,
    soilType,
    terrainType,
    aspect,
    vegetation,
    windSpeed,
    temperature,
    rainfall,
    suitability,
    minH,
    maxH,
  };
}

// 将后端地形数据转换为 TerrainData 格式
function convertBackendTerrain(terrain: any, size: number): TerrainData {
  const elevation = terrain.elevation;
  const slope = terrain.slope || [];
  const solarRad = terrain.solar_radiation || [];

  let minH = Infinity;
  let maxH = -Infinity;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const h = elevation[i]?.[j] ?? 0;
      if (h < minH) minH = h;
      if (h > maxH) maxH = h;
    }
  }

  // 补全缺失的派生数据
  const soilType: number[][] = [];
  const terrainType: number[][] = [];
  const aspect: number[][] = [];
  const vegetation: number[][] = [];
  const windSpeedArr: number[][] = [];
  const temperature: number[][] = [];
  const rainfall: number[][] = [];
  const suitability: number[][] = [];

  for (let i = 0; i < size; i++) {
    soilType[i] = new Array(size);
    terrainType[i] = new Array(size);
    aspect[i] = new Array(size);
    vegetation[i] = new Array(size);
    windSpeedArr[i] = new Array(size);
    temperature[i] = new Array(size);
    rainfall[i] = new Array(size);
    suitability[i] = new Array(size);

    for (let j = 0; j < size; j++) {
      const elev = elevation[i]?.[j] ?? 0;
      const slp = slope[i]?.[j] ?? 0;

      const hL = i > 0 ? (elevation[i - 1]?.[j] ?? elev) : elev;
      const hR = i < size - 1 ? (elevation[i + 1]?.[j] ?? elev) : elev;
      const hD = j > 0 ? (elevation[i]?.[j - 1] ?? elev) : elev;
      const hU = j < size - 1 ? (elevation[i]?.[j + 1] ?? elev) : elev;
      const dzdx = (hR - hL) / 2;
      const dzdy = (hU - hD) / 2;
      let asp = Math.atan2(-dzdx, dzdy) * 180 / Math.PI;
      if (asp < 0) asp += 360;
      aspect[i][j] = asp;

      const sr = solarRad[i]?.[j] ?? 800;
      const derived = computeCellDerived(elev, slp, asp, sr, minH, i, j, size);
      soilType[i][j] = derived.soilType;
      terrainType[i][j] = derived.terrainType;
      vegetation[i][j] = derived.vegetation;
      windSpeedArr[i][j] = derived.windSpeed;
      temperature[i][j] = derived.temperature;
      rainfall[i][j] = derived.rainfall;
      suitability[i][j] = derived.suitability;
    }
  }

  return {
    elevation,
    slope: slope.length > 0 ? slope : elevation.map((row: number[]) => row.map(() => 10)),
    solarRadiation: solarRad.length > 0 ? solarRad : elevation.map((row: number[]) => row.map(() => 900)),
    soilType,
    terrainType,
    aspect,
    vegetation,
    windSpeed: windSpeedArr,
    temperature,
    rainfall,
    suitability,
    minH,
    maxH,
  };
}

// ============================================================================
// 可视化模式
// ============================================================================

type VisMode =
  | 'elevation'
  | 'slope'
  | 'solar'
  | 'soil'
  | 'terrain'
  | 'aspect'
  | 'vegetation'
  | 'wind'
  | 'temperature'
  | 'rainfall'
  | 'suitability';

// 颜色映射 - 每个模式的染色函数
function getColorForMode(
  mode: VisMode,
  i: number,
  j: number,
  data: TerrainData
): THREE.Color {
  const elev = data.elevation[i][j];
  const color = new THREE.Color();

  switch (mode) {
    case 'elevation': {
      const t = (elev - data.minH) / (data.maxH - data.minH + 0.001);
      // 从水 → 草 → 森林 → 岩石 → 雪峰的自然色带
      if (t < 0.08) {
        color.setRGB(0.18, 0.35, 0.55);
      } else if (t < 0.18) {
        // 水岸
        const k = (t - 0.08) / 0.1;
        color.setRGB(0.3 + k * 0.1, 0.5 + k * 0.1, 0.35 - k * 0.15);
      } else if (t < 0.4) {
        const k = (t - 0.18) / 0.22;
        color.setRGB(0.35 + k * 0.1, 0.55 - k * 0.05, 0.22 + k * 0.05);
      } else if (t < 0.65) {
        const k = (t - 0.4) / 0.25;
        color.setRGB(0.45 + k * 0.15, 0.5 - k * 0.05, 0.27 + k * 0.05);
      } else if (t < 0.85) {
        const k = (t - 0.65) / 0.2;
        color.setRGB(0.6 + k * 0.15, 0.5 + k * 0.15, 0.35 + k * 0.15);
      } else {
        const k = (t - 0.85) / 0.15;
        color.setRGB(0.75 + k * 0.2, 0.78 + k * 0.17, 0.8 + k * 0.15);
      }
      break;
    }
    case 'slope': {
      const s = data.slope[i][j];
      const t = Math.min(s / 45, 1);
      // 绿→黄→橙→红 渐变
      if (t < 0.25) color.setRGB(0.2 + t * 1.0, 0.7, 0.2);
      else if (t < 0.5) color.setRGB(0.6, 0.7 - (t - 0.25) * 0.6, 0.2);
      else if (t < 0.75) color.setRGB(0.85, 0.5 - (t - 0.5) * 1.2, 0.15);
      else color.setRGB(0.85 - (t - 0.75) * 0.4, 0.2, 0.15);
      break;
    }
    case 'solar': {
      const r = data.solarRadiation[i][j];
      const t = Math.min(Math.max(r / 1200, 0), 1);
      // 深紫 → 蓝 → 青 → 黄 → 白的热力图
      if (t < 0.2) color.setRGB(0.1, 0.05, 0.3);
      else if (t < 0.4) color.setRGB(0.15, 0.25, 0.6);
      else if (t < 0.6) color.setRGB(0.2, 0.6, 0.7);
      else if (t < 0.8) color.setRGB(0.9, 0.85, 0.3);
      else color.setRGB(1.0, 0.95, 0.6);
      break;
    }
    case 'soil':
      switch (data.soilType[i][j]) {
        case 0: color.setRGB(0.88, 0.75, 0.5); break;
        case 1: color.setRGB(0.6, 0.45, 0.25); break;
        case 2: color.setRGB(0.55, 0.55, 0.58); break;
        case 3: color.setRGB(0.5, 0.35, 0.28); break;
      }
      break;
    case 'terrain':
      switch (data.terrainType[i][j]) {
        case 0: color.setRGB(0.3, 0.7, 0.35); break;
        case 1: color.setRGB(0.5, 0.6, 0.3); break;
        case 2: color.setRGB(0.65, 0.5, 0.3); break;
        case 3: color.setRGB(0.85, 0.85, 0.88); break;
      }
      break;
    case 'aspect': {
      const a = data.aspect[i][j];
      // 使用色相环映射坡向
      const hue = a / 360;
      color.setHSL(hue, 0.7, 0.55);
      break;
    }
    case 'vegetation': {
      const v = data.vegetation[i][j];
      if (v < 0.2) color.setRGB(0.8, 0.72, 0.5);
      else if (v < 0.4) color.setRGB(0.6, 0.7, 0.35);
      else if (v < 0.6) color.setRGB(0.4, 0.6, 0.25);
      else if (v < 0.8) color.setRGB(0.2, 0.5, 0.15);
      else color.setRGB(0.1, 0.4, 0.1);
      break;
    }
    case 'wind': {
      const w = data.windSpeed[i][j];
      const t = Math.min(w / 12, 1);
      color.setRGB(0.2 + t * 0.6, 0.4 + t * 0.5, 0.8 + t * 0.2);
      break;
    }
    case 'temperature': {
      const temp = data.temperature[i][j];
      const t = Math.max(0, Math.min((temp - 5) / 25, 1));
      if (t < 0.33) color.setRGB(0.1, 0.2 + t, 0.7 + t * 0.3);
      else if (t < 0.66) color.setRGB(0.3 + (t - 0.33) * 1.5, 0.7, 0.4);
      else color.setRGB(0.9, 0.7 - (t - 0.66), 0.1);
      break;
    }
    case 'rainfall': {
      const r = data.rainfall[i][j];
      const t = Math.max(0, Math.min((r - 600) / 400, 1));
      color.setRGB(0.8 - t * 0.6, 0.75 - t * 0.25, 0.5 + t * 0.4);
      break;
    }
    case 'suitability': {
      const s = data.suitability[i][j];
      const t = s / 100;
      if (t < 0.2) color.setRGB(0.85, 0.2, 0.2);
      else if (t < 0.4) color.setRGB(0.9, 0.55, 0.2);
      else if (t < 0.6) color.setRGB(0.9, 0.85, 0.2);
      else if (t < 0.8) color.setRGB(0.4, 0.8, 0.2);
      else color.setRGB(0.15, 0.65, 0.25);
      break;
    }
  }
  return color;
}

// ============================================================================
// 地形网格组件 (带交互)
// ============================================================================

type HoverInfo = {
  i: number;
  j: number;
  x: number;
  z: number;
  worldY: number;
  elevation: number;
  slope: number;
  aspect: number;
  solar: number;
  suitability: number;
} | null;

const TERRAIN_SIZE_WORLD = 120; // 世界单位大小

function TerrainMesh({
  data,
  mode,
  onHover,
  onClick,
  showContours,
  wireframe,
}: {
  data: TerrainData;
  mode: VisMode;
  onHover: (h: HoverInfo) => void;
  onClick: (h: HoverInfo) => void;
  showContours: boolean;
  wireframe: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = data.elevation.length;

  // 几何与颜色
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_SIZE_WORLD,
      TERRAIN_SIZE_WORLD,
      size - 1,
      size - 1
    );
    const positions = geo.attributes.position.array as Float32Array;
    const colors = new Float32Array(size * size * 3);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const idx = (i * size + j) * 3;
        // plane 顶点顺序: 逐行 (y轴反向)
        positions[idx + 2] = data.elevation[i][j];

        const c = getColorForMode(mode, i, j, data);
        colors[idx] = c.r;
        colors[idx + 1] = c.g;
        colors[idx + 2] = c.b;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
      flatShading: false,
      envMapIntensity: 0.6,
    });

    return { geometry: geo, material: mat };
  }, [data, mode, size]);

  // 线框材质 (可选)
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      }),
    []
  );

  // ===== 等高线 =====
  // 提取等高线 (简化的 Marching Squares)
  const contourLines = useMemo(() => {
    if (!showContours) return [];
    const levels: number[] = [];
    const step = Math.max(3, (data.maxH - data.minH) / 8);
    for (let lv = Math.ceil(data.minH / step) * step; lv < data.maxH; lv += step) {
      levels.push(lv);
    }

    const half = TERRAIN_SIZE_WORLD / 2;
    const cell = TERRAIN_SIZE_WORLD / (size - 1);

    // PlaneGeometry 的 (i,j) 对应世界坐标
    const worldXZ = (i: number, j: number) => ({
      x: j * cell - half,
      z: i * cell - half,
    });

    const results: { level: number; points: [number, number, number][] }[] = [];

    for (const level of levels) {
      const segments: [number, number, number][] = [];
      for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
          const h00 = data.elevation[i][j];
          const h10 = data.elevation[i + 1][j];
          const h01 = data.elevation[i][j + 1];
          const h11 = data.elevation[i + 1][j + 1];

          const p00 = worldXZ(i, j);
          const p10 = worldXZ(i + 1, j);
          const p01 = worldXZ(i, j + 1);
          const p11 = worldXZ(i + 1, j + 1);

          // 对角三角形 1: 00, 10, 11
          addContourSegment(segments, level, h00, h10, h11, p00, p10, p11);
          // 对角三角形 2: 00, 11, 01
          addContourSegment(segments, level, h00, h11, h01, p00, p11, p01);
        }
      }
      if (segments.length > 0) {
        results.push({ level, points: segments });
      }
    }
    return results;
  }, [data, showContours, size]);

  // 拾取: 把射线命中点转回 (i,j)
  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!e.point) return;
      e.stopPropagation();
      const half = TERRAIN_SIZE_WORLD / 2;
      const px = e.point.x + half;
      const pz = e.point.z + half;
      const cell = TERRAIN_SIZE_WORLD / (size - 1);
      const j = Math.max(0, Math.min(size - 1, Math.round(px / cell)));
      const i = Math.max(0, Math.min(size - 1, Math.round(pz / cell)));
      onHover({
        i,
        j,
        x: e.point.x,
        z: e.point.z,
        worldY: data.elevation[i][j],
        elevation: data.elevation[i][j],
        slope: data.slope[i][j],
        aspect: data.aspect[i][j],
        solar: data.solarRadiation[i][j],
        suitability: data.suitability[i][j],
      });
    },
    [data, onHover, size]
  );

  const handlePointerLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!e.point) return;
      e.stopPropagation();
      const half = TERRAIN_SIZE_WORLD / 2;
      const px = e.point.x + half;
      const pz = e.point.z + half;
      const cell = TERRAIN_SIZE_WORLD / (size - 1);
      const j = Math.max(0, Math.min(size - 1, Math.round(px / cell)));
      const i = Math.max(0, Math.min(size - 1, Math.round(pz / cell)));
      onClick({
        i,
        j,
        x: e.point.x,
        z: e.point.z,
        worldY: data.elevation[i][j],
        elevation: data.elevation[i][j],
        slope: data.slope[i][j],
        aspect: data.aspect[i][j],
        solar: data.solarRadiation[i][j],
        suitability: data.suitability[i][j],
      });
    },
    [data, onClick, size]
  );

  return (
    <group>
      {/* 主地形 */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />

      {/* 可选线框叠层 */}
      {wireframe && (
        <mesh
          geometry={geometry}
          material={wireMat}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.05, 0]}
        />
      )}

      {/* 等高线 */}
      {showContours &&
        contourLines.map((cl, idx) => (
          <Line
            key={idx}
            points={cl.points}
            color="#ffffff"
            lineWidth={1.2}
            transparent
            opacity={0.55}
          />
        ))}
    </group>
  );
}

// 计算等高线的一个三角形命中段
function addContourSegment(
  out: [number, number, number][],
  level: number,
  hA: number,
  hB: number,
  hC: number,
  pA: { x: number; z: number },
  pB: { x: number; z: number },
  pC: { x: number; z: number }
) {
  const pts: [number, number, number][] = [];
  const edge = (h1: number, h2: number, p1: { x: number; z: number }, p2: { x: number; z: number }) => {
    if ((h1 - level) * (h2 - level) < 0) {
      const t = (level - h1) / (h2 - h1);
      const x = p1.x + (p2.x - p1.x) * t;
      const z = p1.z + (p2.z - p1.z) * t;
      pts.push([x, level + 0.12, z]);
    }
  };
  edge(hA, hB, pA, pB);
  edge(hB, hC, pB, pC);
  edge(hC, hA, pC, pA);
  if (pts.length === 2) {
    out.push(pts[0], pts[1]);
  }
}

// ============================================================================
// 光伏设备与可建设区域
// ============================================================================

type BuildablePos = {
  x: number;
  z: number;
  height: number;
  category: 'excellent' | 'good' | 'fair';
  equipmentType: 'solar_panel' | 'inverter' | 'battery' | 'transformer';
  orientation: number;
  size: 'small' | 'medium' | 'large';
};

function BuildableAreas({ data }: { data: TerrainData }) {
  const areas = useMemo<BuildablePos[]>(() => {
    const positions: BuildablePos[] = [];
    const size = data.elevation.length;
    const cell = TERRAIN_SIZE_WORLD / (size - 1);
    const half = TERRAIN_SIZE_WORLD / 2;

    const placed: { x: number; z: number; spacing: number }[] = [];
    const canPlace = (x: number, z: number, spacing: number) => {
      for (const p of placed) {
        const d = Math.hypot(x - p.x, z - p.z);
        if (d < (spacing + p.spacing) / 2) return false;
      }
      return true;
    };

    for (let i = 6; i < size - 6; i += 5) {
      for (let j = 6; j < size - 6; j += 5) {
        const suit = data.suitability[i][j];
        const slope = data.slope[i][j];
        const asp = data.aspect[i][j];

        if (suit < 55 || slope > 30) continue;

        const x = j * cell - half;
        const z = i * cell - half;
        const height = data.elevation[i][j];

        let equipmentType: BuildablePos['equipmentType'] = 'solar_panel';
        let spacing = 3;
        const aspectDiff = Math.abs(asp - 180);
        const goodAspect = aspectDiff < 60 || aspectDiff > 300;

        if (suit > 75 && slope < 15 && goodAspect) {
          equipmentType = 'solar_panel';
          spacing = 3;
        } else if (suit > 70) {
          equipmentType = 'transformer';
          spacing = 6;
        } else if (suit > 65) {
          equipmentType = 'inverter';
          spacing = 5;
        } else {
          equipmentType = 'battery';
          spacing = 4;
        }

        if (!canPlace(x, z, spacing)) continue;

        placed.push({ x, z, spacing });

        let category: BuildablePos['category'] = 'fair';
        if (slope < 8 && suit > 85) category = 'excellent';
        else if (slope < 15 && suit > 72) category = 'good';

        const orientation = ((180 - asp) * Math.PI) / 180;

        let sz: BuildablePos['size'] = 'medium';
        if (suit > 88 && slope < 6) sz = 'large';
        else if (suit < 70) sz = 'small';

        positions.push({
          x,
          z,
          height,
          category,
          equipmentType,
          orientation,
          size: sz,
        });
      }
    }

    return positions;
  }, [data]);

  // 几何与材质缓存
  const geos = useMemo(() => {
    return {
      panel: {
        small: new THREE.BoxGeometry(2.2, 0.1, 1.5),
        medium: new THREE.BoxGeometry(3.0, 0.1, 2.0),
        large: new THREE.BoxGeometry(3.8, 0.1, 2.5),
      } as const,
      panelStand: new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6),
      inverter: new THREE.BoxGeometry(1.6, 1.8, 0.8),
      battery: new THREE.CylinderGeometry(0.7, 0.7, 1.4, 20),
      transformer: new THREE.BoxGeometry(1.8, 1.8, 1.8),
    };
  }, []);

  const mats = useMemo(() => {
    return {
      panelGlass: new THREE.MeshStandardMaterial({
        color: '#1a3a6a',
        metalness: 0.8,
        roughness: 0.15,
        emissive: '#1a5aa0',
        emissiveIntensity: 0.35,
      }),
      panelFrame: new THREE.MeshStandardMaterial({
        color: '#8a8a95',
        metalness: 0.9,
        roughness: 0.4,
      }),
      stand: new THREE.MeshStandardMaterial({
        color: '#555560',
        metalness: 0.6,
        roughness: 0.55,
      }),
      inverter: new THREE.MeshStandardMaterial({
        color: '#3d8ce8',
        metalness: 0.5,
        roughness: 0.4,
        emissive: '#1a5ab8',
        emissiveIntensity: 0.3,
      }),
      battery: new THREE.MeshStandardMaterial({
        color: '#e05040',
        metalness: 0.4,
        roughness: 0.5,
        emissive: '#a02020',
        emissiveIntensity: 0.25,
      }),
      transformer: new THREE.MeshStandardMaterial({
        color: '#9aa3a8',
        metalness: 0.65,
        roughness: 0.35,
      }),
    };
  }, []);

  const categoryColor = (c: BuildablePos['category']) =>
    c === 'excellent' ? '#00ff88' : c === 'good' ? '#00d4ff' : '#ffcc33';

  return (
    <group>
      {areas.map((p, idx) => (
        <group key={idx} position={[p.x, p.height + 0.1, p.z]}>
          {/* 基座标记 (发光地板) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 2.0, 24]} />
            <meshBasicMaterial
              color={categoryColor(p.category)}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {p.equipmentType === 'solar_panel' && (
            <group rotation={[0, p.orientation, 0]}>
              {/* 支架 */}
              <mesh
                geometry={geos.panelStand}
                material={mats.stand}
                position={[-0.7, 0.3, 0]}
              />
              <mesh
                geometry={geos.panelStand}
                material={mats.stand}
                position={[0.7, 0.3, 0]}
              />
              {/* 斜面板 (南倾15度) */}
              <group position={[0, 0.7, 0]} rotation={[(-15 * Math.PI) / 180, 0, 0]}>
                <mesh
                  geometry={geos.panel[p.size]}
                  material={mats.panelGlass}
                />
              </group>
            </group>
          )}

          {p.equipmentType === 'inverter' && (
            <mesh
              geometry={geos.inverter}
              material={mats.inverter}
              position={[0, 0.7, 0]}
            />
          )}

          {p.equipmentType === 'battery' && (
            <mesh
              geometry={geos.battery}
              material={mats.battery}
              position={[0, 0.55, 0]}
            />
          )}

          {p.equipmentType === 'transformer' && (
            <mesh
              geometry={geos.transformer}
              material={mats.transformer}
              position={[0, 0.7, 0]}
            />
          )}
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// 太阳 (可动)
// ============================================================================

function SunLight({ timeOfDay }: { timeOfDay: number }) {
  const theta = ((timeOfDay - 6) / 12) * Math.PI;
  const sunX = Math.cos(theta) * 100;
  const sunY = Math.max(25, Math.sin(theta) * 70);
  const sunZ = 40;

  return (
    <>
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={1.4}
        color={timeOfDay < 7 || timeOfDay > 17 ? '#ffb070' : '#fffbe6'}
      />

      {/* 可见太阳 (远处小球) */}
      <mesh position={[sunX * 1.5, sunY * 1.5, sunZ * 1.5]}>
        <sphereGeometry args={[4, 12, 12]} />
        <meshBasicMaterial color={timeOfDay < 7 || timeOfDay > 17 ? '#ffa050' : '#ffe680'} />
      </mesh>
    </>
  );
}

// ============================================================================
// 场景
// ============================================================================

// 根据 hover 数据生成简洁的适宜性理由
function suitabilityReason(h: NonNullable<HoverInfo>): string {
  const parts: string[] = [];
  if (h.slope > 25) parts.push('坡度过陡');
  else if (h.slope < 15) parts.push('坡度平缓');
  else parts.push('坡度适中');

  if (h.solar > 950) parts.push('辐射强');
  else if (h.solar < 700) parts.push('辐射偏低');

  const aspectDiff = Math.abs(h.aspect - 180);
  if (aspectDiff < 45) parts.push('正南向');
  else if (aspectDiff > 135) parts.push('北向遮挡');

  return parts.join(' · ');
}

function HoverTooltip({ hover }: { hover: HoverInfo }) {
  if (!hover) return null;
  const reason = suitabilityReason(hover);
  return (
    <Html position={[hover.x, hover.worldY + 4, hover.z]} center>
      <div
        style={{
          background: 'rgba(8, 18, 38, 0.92)',
          border: '1px solid rgba(0, 212, 255, 0.5)',
          borderRadius: 8,
          padding: '6px 10px',
          color: '#cfe7ff',
          fontSize: 11,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 12px rgba(0, 212, 255, 0.25)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div>海拔 {(1200 + hover.elevation).toFixed(1)} m</div>
        <div>坡度 {hover.slope.toFixed(1)}°</div>
        <div>辐射 {hover.solar.toFixed(0)} W/m²</div>
        <div>
          适宜性{' '}
          <span style={{ color: hover.suitability > 60 ? '#00ff88' : '#ffcc33' }}>
            {hover.suitability.toFixed(0)}
          </span>
        </div>
        {reason && (
          <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(0,212,255,0.2)', color: '#9bb8d8', fontSize: 10 }}>
            {reason}
          </div>
        )}
      </div>
    </Html>
  );
}

function PinMarker({
  position,
  label,
  selected,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <group position={position}>
      {/* 立柱 */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
        <meshStandardMaterial
          color={selected ? '#ff4da6' : '#ff6b35'}
          emissive={selected ? '#ff4da6' : '#ff6b35'}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* 圆球头 */}
      <mesh position={[0, 2.6, 0]} onClick={onClick}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={selected ? '#ff4da6' : '#ff6b35'}
          emissive={selected ? '#ff4da6' : '#ff6b35'}
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* 脉冲光环 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 24]} />
        <meshBasicMaterial
          color={selected ? '#ff4da6' : '#ff6b35'}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 标签 */}
      <Billboard position={[0, 3.8, 0]}>
        <Text
          fontSize={0.9}
          color="#ffffff"
          outlineColor="#000000"
          outlineWidth={0.05}
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

// 相机控制器 + 重置句柄转发
function CameraController({
  controlsRef,
  autoRotate,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(80, 70, 80);
    camera.lookAt(0, 10, 0);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef as React.Ref<OrbitControlsImpl>}
      enablePan
      enableZoom
      enableRotate
      minDistance={30}
      maxDistance={220}
      maxPolarAngle={Math.PI / 2 - 0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      target={[0, 10, 0]}
    />
  );
}

// 漂浮云朵组件
const CLOUD_CONFIGS = [
  { pos: [-35, 50, -25], scale: [18, 4, 12], speed: 0.08, phase: 0, opacity: 0.3 },
  { pos: [30, 56, 10], scale: [22, 5, 14], speed: 0.06, phase: 1.5, opacity: 0.25 },
  { pos: [-5, 62, 35], scale: [16, 3.5, 10], speed: 0.1, phase: 3, opacity: 0.22 },
  { pos: [45, 48, -30], scale: [14, 3, 9], speed: 0.07, phase: 4.5, opacity: 0.2 },
  { pos: [-20, 58, 20], scale: [12, 3, 8], speed: 0.09, phase: 2, opacity: 0.18 },
] as const;

function FloatingClouds() {
  const groupRef = useRef<THREE.Group>(null);
  const cloudGeo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const cfg = CLOUD_CONFIGS[i];
      if (!cfg) return;
      child.position.x = cfg.pos[0] + Math.sin(t * cfg.speed + cfg.phase) * 8;
      child.position.y = cfg.pos[1] + Math.sin(t * cfg.speed * 0.7 + cfg.phase) * 1.5;
    });
  });

  return (
    <group ref={groupRef}>
      {CLOUD_CONFIGS.map((cfg, i) => (
        <group key={i} position={[cfg.pos[0], cfg.pos[1], cfg.pos[2]]}>
          {/* 主体 */}
          <mesh geometry={cloudGeo} scale={[cfg.scale[0], cfg.scale[1], cfg.scale[2]]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={cfg.opacity} depthWrite={false} />
          </mesh>
          {/* 副体 (偏移产生蓬松感) */}
          <mesh geometry={cloudGeo} scale={[cfg.scale[0] * 0.7, cfg.scale[1] * 1.2, cfg.scale[2] * 0.6]} position={[cfg.scale[0] * 0.3, cfg.scale[1] * 0.2, 0]}>
            <meshBasicMaterial color="#eef5ff" transparent opacity={cfg.opacity * 0.8} depthWrite={false} />
          </mesh>
          <mesh geometry={cloudGeo} scale={[cfg.scale[0] * 0.5, cfg.scale[1] * 0.9, cfg.scale[2] * 0.7]} position={[-cfg.scale[0] * 0.25, cfg.scale[1] * 0.15, cfg.scale[2] * 0.15]}>
            <meshBasicMaterial color="#f0f8ff" transparent opacity={cfg.opacity * 0.6} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SceneFull({
  data,
  mode,
  showAxes,
  showGrid,
  showContours,
  wireframe,
  showClouds,
  showSparkles,
  timeOfDay,
  markers,
  hover,
  setHover,
  onClickTerrain,
  controlsRef,
  autoRotate,
  onSceneReady,
}: {
  data: TerrainData;
  mode: VisMode;
  showAxes: boolean;
  showGrid: boolean;
  showContours: boolean;
  wireframe: boolean;
  showClouds: boolean;
  showSparkles: boolean;
  timeOfDay: number;
  markers: {
    id: string;
    x: number;
    y: number;
    z: number;
    name: string;
  }[];
  hover: HoverInfo;
  setHover: (h: HoverInfo) => void;
  onClickTerrain: (h: HoverInfo) => void;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  autoRotate: boolean;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera, gl: THREE.WebGLRenderer) => void;
}) {
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    onSceneReady?.(scene, camera, gl);
  }, [scene, camera, gl, onSceneReady]);

  const axesHelper = useMemo(() => new THREE.AxesHelper(25), []);

  // 基于时间的天空背景色
  const bgColor = useMemo(() => {
    if (timeOfDay < 7 || timeOfDay > 17) return '#2a3a5c'; // 日出/日落
    if (timeOfDay < 8 || timeOfDay > 16) return '#6a90c0'; // 早晚
    return '#87CEEB'; // 白天
  }, [timeOfDay]);

  return (
    <>
      {/* 天空背景色 (替代 Sky 组件以保证兼容性) */}
      <color attach="background" args={[bgColor]} />

      {/* 雾效 */}
      <fog attach="fog" args={[bgColor, 160, 400]} />

      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#bde0ff', '#3a2a1a', 0.35]} />

      {/* 太阳 */}
      <SunLight timeOfDay={timeOfDay} />

      {/* 填充光 */}
      <directionalLight position={[-40, 50, -30]} intensity={0.18} color="#dceeff" />

      {/* 地形 */}
      <TerrainMesh
        data={data}
        mode={mode}
        onHover={setHover}
        onClick={onClickTerrain}
        showContours={showContours}
        wireframe={wireframe}
      />

      {/* 可建设区域 */}
      <BuildableAreas data={data} />

      {/* 云层 (椭球体 + 漂浮动画) */}
      {showClouds && <FloatingClouds />}

      {/* 粒子氛围 */}
      {showSparkles && (
        <Sparkles
          count={150}
          scale={[130, 50, 130]}
          position={[0, 30, 0]}
          size={2}
          speed={0.2}
          opacity={0.6}
          color="#a0e0ff"
        />
      )}

      {/* 标记点 */}
      {markers.map((m) => (
        <PinMarker
          key={m.id}
          position={[m.x, m.y, m.z]}
          label={m.name}
        />
      ))}

      {/* Hover 悬浮提示 */}
      <HoverTooltip hover={hover} />

      {/* 网格 */}
      {showGrid && (
        <Grid
          position={[0, 0.02, 0]}
          args={[200, 200]}
          cellSize={5}
          cellThickness={0.6}
          cellColor="#00d4ff"
          sectionSize={25}
          sectionThickness={1.3}
          sectionColor="#00b4d8"
          fadeDistance={180}
          fadeStrength={1.0}
          infiniteGrid
        />
      )}

      {/* 坐标轴 */}
      {showAxes && <primitive object={axesHelper} position={[-55, data.minH, -55]} />}

      <CameraController controlsRef={controlsRef} autoRotate={autoRotate} />
    </>
  );
}

// ============================================================================
// UI: 可视化模式选择 (分类下拉)
// ============================================================================

const visGroups: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { id: VisMode; label: string }[];
}[] = [
  {
    label: '地形',
    icon: Mountain,
    items: [
      { id: 'elevation', label: '海拔高度' },
      { id: 'slope', label: '坡度分析' },
      { id: 'aspect', label: '坡向分布' },
      { id: 'terrain', label: '地形类型' },
      { id: 'soil', label: '土壤类型' },
    ],
  },
  {
    label: '气候',
    icon: WindIcon,
    items: [
      { id: 'solar', label: '太阳辐射' },
      { id: 'wind', label: '风速分布' },
      { id: 'temperature', label: '温度分布' },
      { id: 'rainfall', label: '降雨分布' },
    ],
  },
  {
    label: '规划',
    icon: Sparkle,
    items: [
      { id: 'vegetation', label: '植被覆盖' },
      { id: 'suitability', label: '适宜性分析' },
    ],
  },
];

function VisModeSelector({
  mode,
  onChange,
  theme,
}: {
  mode: VisMode;
  onChange: (m: VisMode) => void;
  theme: 'dark' | 'light';
}) {
  const currentLabel = useMemo(() => {
    for (const g of visGroups) {
      const f = g.items.find((it) => it.id === mode);
      if (f) return `${g.label} · ${f.label}`;
    }
    return '海拔高度';
  }, [mode]);

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all ${
          theme === 'dark'
            ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/40 hover:bg-cyan-400/20'
            : 'bg-cyan-50 text-cyan-700 border-cyan-300 hover:bg-cyan-100'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-2 z-30 min-w-[260px] rounded-lg border shadow-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#0a1628]/95 border-cyan-500/30 backdrop-blur-md'
                : 'bg-white border-gray-200'
            }`}
          >
            {visGroups.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="py-1">
                  <div
                    className={`px-3 py-1.5 flex items-center gap-2 text-xs uppercase tracking-wider ${
                      theme === 'dark' ? 'text-cyan-400/70' : 'text-gray-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {g.label}
                  </div>
                  {g.items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => {
                        onChange(it.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-5 py-1.5 text-sm transition-colors ${
                        mode === it.id
                          ? theme === 'dark'
                            ? 'bg-cyan-400/15 text-cyan-300'
                            : 'bg-cyan-50 text-cyan-700'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:bg-white/5'
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 图例 (随主题变化)
function Legend({ mode, theme }: { mode: VisMode; theme: 'dark' | 'light' }) {
  const legends: Record<VisMode, { color: string; label: string }[]> = {
    elevation: [
      { color: '#2d5a8c', label: '水域 / 低谷' },
      { color: '#4a8c3a', label: '低海拔 · 森林' },
      { color: '#7c8c40', label: '中海拔 · 草地' },
      { color: '#a07940', label: '高海拔 · 岩石' },
      { color: '#dcdce0', label: '山峰 · 雪线' },
    ],
    slope: [
      { color: '#33b33a', label: '平缓 <15°' },
      { color: '#b3b335', label: '中等 15-25°' },
      { color: '#d98030', label: '陡峭 25-35°' },
      { color: '#d93030', label: '极陡 >35°' },
    ],
    solar: [
      { color: '#1a0d4c', label: '< 600 W/m²' },
      { color: '#264d99', label: '600-800' },
      { color: '#339db3', label: '800-1000' },
      { color: '#e6d94d', label: '1000-1100' },
      { color: '#fff299', label: '> 1100' },
    ],
    soil: [
      { color: '#e0bf80', label: '砂土' },
      { color: '#996640', label: '壤土' },
      { color: '#8c8c94', label: '岩石' },
      { color: '#805947', label: '黏土' },
    ],
    terrain: [
      { color: '#4db34d', label: '平原' },
      { color: '#80994d', label: '丘陵' },
      { color: '#a6804d', label: '山地' },
      { color: '#d9d9e0', label: '高山' },
    ],
    aspect: [
      { color: 'hsl(0, 70%, 55%)', label: '北 (0°)' },
      { color: 'hsl(45, 70%, 55%)', label: '东北' },
      { color: 'hsl(90, 70%, 55%)', label: '东' },
      { color: 'hsl(135, 70%, 55%)', label: '东南' },
      { color: 'hsl(180, 70%, 55%)', label: '南' },
      { color: 'hsl(225, 70%, 55%)', label: '西南' },
      { color: 'hsl(270, 70%, 55%)', label: '西' },
      { color: 'hsl(315, 70%, 55%)', label: '西北' },
    ],
    vegetation: [
      { color: '#ccb880', label: '稀疏' },
      { color: '#99b359', label: '低植被' },
      { color: '#66994d', label: '中等' },
      { color: '#338026', label: '高植被' },
      { color: '#1a6619', label: '茂密' },
    ],
    wind: [
      { color: '#3366cc', label: '< 6 m/s' },
      { color: '#4d80d9', label: '6-8 m/s' },
      { color: '#6699e6', label: '8-10 m/s' },
      { color: '#99c2f2', label: '> 10 m/s' },
    ],
    temperature: [
      { color: '#1a33b3', label: '< 10°C' },
      { color: '#3399b3', label: '10-18°C' },
      { color: '#80b33d', label: '18-25°C' },
      { color: '#e6802d', label: '> 25°C' },
    ],
    rainfall: [
      { color: '#ccb880', label: '< 700 mm' },
      { color: '#b3a366', label: '700-800' },
      { color: '#668cb3', label: '800-900' },
      { color: '#2d5ab3', label: '> 900 mm' },
    ],
    suitability: [
      { color: '#d93030', label: '极不适合 <20' },
      { color: '#e68a33', label: '不适合 20-40' },
      { color: '#e6d94d', label: '一般 40-60' },
      { color: '#66cc33', label: '适合 60-80' },
      { color: '#26a640', label: '极适合 >80' },
    ],
  };

  return (
    <div
      className={`absolute bottom-4 left-4 rounded-xl p-3 border shadow-lg backdrop-blur-md ${
        theme === 'dark'
          ? 'bg-[#0a1628]/75 border-cyan-500/30'
          : 'bg-white/90 border-gray-200'
      }`}
    >
      <h4
        className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
          theme === 'dark' ? 'text-cyan-300' : 'text-gray-700'
        }`}
      >
        图例
      </h4>
      <div className="space-y-1.5">
        {legends[mode].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded shadow-inner"
              style={{
                backgroundColor: item.color,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            />
            <span
              className={`text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 方向指示器 (小罗盘)
function Compass2D({ controlsRef }: { controlsRef: React.MutableRefObject<OrbitControlsImpl | null> }) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = controlsRef.current;
      if (c) {
        const cam = c.object as THREE.Camera;
        const dir = new THREE.Vector3();
        cam.getWorldDirection(dir);
        const theta = Math.atan2(dir.x, dir.z);
        setAngle((theta * 180) / Math.PI);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [controlsRef]);

  return (
    <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center relative shadow-lg">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `rotate(${-angle}deg)` }}
      >
        <div className="relative w-10 h-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 text-[10px] text-red-400 font-bold">
            N
          </div>
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 text-[10px] text-gray-300">
            S
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] text-gray-300">
            W
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[10px] text-gray-300">
            E
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[14px] border-l-transparent border-r-transparent border-b-red-400" />
        </div>
      </div>
      <Compass className="w-3 h-3 text-cyan-300/50 absolute" />
    </div>
  );
}

// ============================================================================
// 主组件
// ============================================================================

export default function TerrainView() {
  const { theme, currentInstanceId } = useAppStore();
  const [visualizationMode, setVisualizationMode] = useState<VisMode>('elevation');
  const [showAxes, setShowAxes] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const [showSparkles, setShowSparkles] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [markers, setMarkers] = useState<
    { id: string; x: number; y: number; z: number; name: string }[]
  >([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [hover, setHover] = useState<HoverInfo>(null);
  const [pinned, setPinned] = useState<HoverInfo>(null);
  const [showProfileTool, setShowProfileTool] = useState(false);
  const [profilePoints, setProfilePoints] = useState<[number, number, number][]>([]);
  const [equipmentLayoutMode, setEquipmentLayoutMode] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<'solar_panel' | 'inverter' | 'battery' | 'transformer'>('solar_panel');
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  
  // 只使用本地生成的地形数据（原来的样式）
  const terrainData = useMemo(() => generateTerrainData(96), []);

  // 从地形数据派生的统计 (不再是硬编码)
  const stats = useMemo(() => {
    let sumH = 0;
    let sumSlope = 0;
    let sumSolar = 0;
    let suitableCount = 0;
    let total = 0;
    let maxSlope = 0;
    let maxH = -Infinity;
    let minH = Infinity;

    const size = terrainData.elevation.length;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const h = terrainData.elevation[i][j];
        const sl = terrainData.slope[i][j];
        const sr = terrainData.solarRadiation[i][j];
        const su = terrainData.suitability[i][j];
        sumH += h;
        sumSlope += sl;
        sumSolar += sr;
        if (su > 65) suitableCount++;
        total++;
        if (sl > maxSlope) maxSlope = sl;
        if (h > maxH) maxH = h;
        if (h < minH) minH = h;
      }
    }
    return [
      { label: '总面积', value: '8480', unit: '亩', icon: Ruler },
      {
        label: '可建设面积',
        value: ((suitableCount / total) * 8480).toFixed(0),
        unit: '亩',
        icon: Layers,
      },
      { label: '平均海拔', value: (1200 + sumH / total).toFixed(0), unit: 'm', icon: Mountain },
      {
        label: '年均辐射',
        value: (900 + (sumSolar / total) * 0.8).toFixed(0),
        unit: 'kWh/m²',
        icon: Sun,
      },
      { label: '平均坡度', value: (sumSlope / total).toFixed(1), unit: '°', icon: Mountain },
      {
        label: '适建比例',
        value: ((suitableCount / total) * 100).toFixed(1),
        unit: '%',
        icon: MapIcon,
      },
    ];
  }, [terrainData]);

  // 分析报告动态数据
  const analysisData = useMemo(() => {
    const size = terrainData.elevation.length;
    const terrainCounts = [0, 0, 0, 0]; // plain, hill, mountain, highMountain
    const soilCounts = [0, 0, 0, 0]; // sandy, loam, rock, clay
    let totalAspect = 0;
    let total = 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        terrainCounts[terrainData.terrainType[i][j]]++;
        soilCounts[terrainData.soilType[i][j]]++;
        totalAspect += terrainData.aspect[i][j];
        total++;
      }
    }

    const terrainNames = ['平原', '丘陵', '山地', '高山'];
    const soilNames = ['砂土', '壤土', '岩石', '黏土'];

    // 排序找前两个地形
    const sortedTerrain = terrainCounts
      .map((c, i) => ({ name: terrainNames[i], pct: (c / total * 100) }))
      .sort((a, b) => b.pct - a.pct);

    const sortedSoil = soilCounts
      .map((c, i) => ({ name: soilNames[i], pct: (c / total * 100) }))
      .sort((a, b) => b.pct - a.pct);

    const avgAspect = totalAspect / total;
    let direction = '正南';
    const diff = avgAspect - 180;
    if (Math.abs(diff) < 5) direction = '正南';
    else if (diff > 0) direction = `正南偏西 ${Math.abs(diff).toFixed(0)}°`;
    else direction = `正南偏东 ${Math.abs(diff).toFixed(0)}°`;

    return {
      mainTerrain: `${sortedTerrain[0].name} ${sortedTerrain[0].pct.toFixed(0)}% + ${sortedTerrain[1].name} ${sortedTerrain[1].pct.toFixed(0)}%`,
      mainSoil: `${sortedSoil[0].name} / ${sortedSoil[1].name}`,
      optimalDirection: direction,
    };
  }, [terrainData]);

  const handleExportData = useCallback(() => {
    const payload = {
      elevation: terrainData.elevation,
      slope: terrainData.slope,
      solar: terrainData.solarRadiation,
      suitability: terrainData.suitability,
      markers,
      generatedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(payload);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrain-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [terrainData, markers]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.markers && Array.isArray(data.markers)) {
            setMarkers(data.markers);
          }
          alert(`已载入数据 (${data.markers?.length ?? 0} 个标记点)`);
        } catch {
          alert('数据格式无效');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleAddMarker = useCallback(() => {
    if (pinned) {
      setMarkers((prev) => [
        ...prev,
        {
          id: `marker-${Date.now()}`,
          x: pinned.x,
          y: pinned.worldY,
          z: pinned.z,
          name: `点${prev.length + 1}`,
        },
      ]);
    } else {
      // 随机位置
      setMarkers((prev) => [
        ...prev,
        {
          id: `marker-${Date.now()}`,
          x: (Math.random() - 0.5) * 80,
          y: 25,
          z: (Math.random() - 0.5) * 80,
          name: `点${prev.length + 1}`,
        },
      ]);
    }
  }, [pinned]);

  const handleClearMarkers = useCallback(() => {
    setMarkers([]);
    setPinned(null);
  }, []);

  const handleResetView = useCallback(() => {
    const controls = controlsRef.current;
    if (controls) {
      const cam = controls.object as THREE.PerspectiveCamera;
      cam.position.set(80, 70, 80);
      controls.target.set(0, 10, 0);
      controls.update();
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    gl.domElement.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terrain-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, []);

  const handleClickTerrain = useCallback((h: HoverInfo) => {
    if (showProfileTool) {
      handleProfilePointAdd(h);
    } else if (equipmentLayoutMode) {
      handleEquipmentPlacement(h);
    } else {
      setPinned(h);
    }
  }, [showProfileTool, equipmentLayoutMode]);

  // 地形剖面分析工具
  const handleProfilePointAdd = (point: HoverInfo) => {
    if (!point) return;
    setProfilePoints([...profilePoints, [point.x, point.worldY, point.z]]);
  };

  const clearProfilePoints = () => {
    setProfilePoints([]);
  };

  // 设备布局规划
  const handleEquipmentPlacement = (point: HoverInfo) => {
    if (!point || !equipmentLayoutMode) return;
    // 这里可以添加设备放置的逻辑
    console.log('放置设备:', selectedEquipment, '在位置:', point);
  };

  // 生成地形分析报告
  const generateTerrainReport = () => {
    if (!terrainData) return null;
    
    const report = {
      area: terrainData.elevation.length * terrainData.elevation.length,
      minElevation: terrainData.minH,
      maxElevation: terrainData.maxH,
      avgSlope: terrainData.slope.flat().reduce((a, b) => a + b, 0) / (terrainData.slope.length * terrainData.slope[0].length),
      solarPotential: terrainData.solarRadiation.flat().reduce((a, b) => a + b, 0) / (terrainData.solarRadiation.length * terrainData.solarRadiation[0].length),
      suitableArea: terrainData.suitability.flat().filter(s => s > 60).length,
      verySuitableArea: terrainData.suitability.flat().filter(s => s > 80).length
    };

    return report;
  };

  const onSceneReady = useCallback(
    (_scene: THREE.Scene, _camera: THREE.Camera, gl: THREE.WebGLRenderer) => {
      glRef.current = gl;
    },
    []
  );

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'r' || e.key === 'R') handleResetView();
      if (e.key === 'g' || e.key === 'G') setShowGrid((v) => !v);
      if (e.key === 'c' || e.key === 'C') setShowContours((v) => !v);
      if (e.key === 'w' || e.key === 'W') setWireframe((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleResetView]);

  const isDark = theme === 'dark';

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 border-b ${
          isDark ? 'border-cyan-500/20 bg-[#0a0f1a]/60' : 'border-gray-200 bg-white/60'
        } gap-3 backdrop-blur-md`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* 数据来源标注 */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border ${isDark ? 'bg-orange-400/10 text-orange-300 border-orange-400/30' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
            <span className={`w-2 h-2 rounded-full bg-orange-400`} />
            模拟地形数据
          </div>

          <div className={`h-6 w-px ${isDark ? 'bg-cyan-500/20' : 'bg-gray-300'}`} />

          <VisModeSelector
            mode={visualizationMode}
            onChange={setVisualizationMode}
            theme={isDark ? 'dark' : 'light'}
          />

          <div
            className={`h-6 w-px ${isDark ? 'bg-cyan-500/20' : 'bg-gray-300'}`}
          />

          {/* 时间滑块 */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              isDark
                ? 'bg-white/5 border-white/10 text-gray-300'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <Sun className={`w-4 h-4 ${isDark ? 'text-yellow-300' : 'text-yellow-500'}`} />
            <input
              type="range"
              min={5}
              max={19}
              step={0.5}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="text-xs tabular-nums w-10">
              {Math.floor(timeOfDay)}:
              {String(Math.round((timeOfDay % 1) * 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <ToolBtn
            active={showContours}
            onClick={() => setShowContours((v) => !v)}
            icon={Mountain}
            label="等高线"
            isDark={isDark}
            title="显示等高线 (C)"
          />
          <ToolBtn
            active={wireframe}
            onClick={() => setWireframe((v) => !v)}
            icon={Layers}
            label="线框"
            isDark={isDark}
            title="显示网格线框 (W)"
          />
          <ToolBtn
            active={showGrid}
            onClick={() => setShowGrid((v) => !v)}
            icon={MapIcon}
            label="网格"
            isDark={isDark}
            title="地面网格 (G)"
          />
          <ToolBtn
            active={showClouds}
            onClick={() => setShowClouds((v) => !v)}
            icon={Sparkle}
            label="云层"
            isDark={isDark}
          />
          <ToolBtn
            active={showSparkles}
            onClick={() => setShowSparkles((v) => !v)}
            icon={Sparkle}
            label="粒子"
            isDark={isDark}
          />
          <ToolBtn
            active={showEquipment}
            onClick={() => setShowEquipment((v) => !v)}
            icon={showEquipment ? Eye : EyeOff}
            label="设备"
            isDark={isDark}
          />
          <ToolBtn
            active={autoRotate}
            onClick={() => setAutoRotate((v) => !v)}
            icon={RotateCcw}
            label="自转"
            isDark={isDark}
          />
          <ToolBtn
            active={showAxes}
            onClick={() => setShowAxes((v) => !v)}
            icon={Info}
            label="坐标轴"
            isDark={isDark}
          />

          <div className={`h-6 w-px mx-1 ${isDark ? 'bg-cyan-500/20' : 'bg-gray-300'}`} />

          <ToolBtn
            onClick={handleAddMarker}
            icon={Pin}
            label="标记"
            isDark={isDark}
            title={pinned ? '在选中点添加标记' : '添加随机标记'}
          />
          {markers.length > 0 && (
            <ToolBtn
              onClick={handleClearMarkers}
              icon={Trash2}
              label=""
              isDark={isDark}
              title="清空标记"
            />
          )}
          <ToolBtn
            onClick={handleResetView}
            icon={RotateCcw}
            label="重置"
            isDark={isDark}
            title="重置视角 (R)"
          />
          <ToolBtn
            onClick={handleScreenshot}
            icon={Camera}
            label="截图"
            isDark={isDark}
          />
          <ToolBtn onClick={handleExportData} icon={Download} label="导出" isDark={isDark} />
          <ToolBtn onClick={handleImportData} icon={Upload} label="导入" isDark={isDark} />
          
          <div className={`h-6 w-px mx-1 ${isDark ? 'bg-cyan-500/20' : 'bg-gray-300'}`} />
          
          <ToolBtn
            active={showProfileTool}
            onClick={() => setShowProfileTool((v) => !v)}
            icon={Ruler}
            label="剖面"
            isDark={isDark}
            title="地形剖面分析"
          />
          {showProfileTool && (
            <ToolBtn
              onClick={clearProfilePoints}
              icon={Trash2}
              label=""
              isDark={isDark}
              title="清除剖面点"
            />
          )}
          
          <ToolBtn
            active={equipmentLayoutMode}
            onClick={() => setEquipmentLayoutMode((v) => !v)}
            icon={Grid3X3}
            label="布局"
            isDark={isDark}
            title="设备布局规划"
          />
          {equipmentLayoutMode && (
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as any)}
              className={`px-2 py-1 rounded text-xs border ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <option value="solar_panel">光伏板</option>
              <option value="inverter">逆变器</option>
              <option value="battery">电池</option>
              <option value="transformer">变压器</option>
            </select>
          )}
          <ToolBtn
            active={showAnalysis}
            onClick={() => setShowAnalysis((v) => !v)}
            icon={FileText}
            label="分析"
            isDark={isDark}
          />
        </div>
      </motion.div>

      {/* 3D 视口 */}
      <div className="flex-1 relative" style={{ minHeight: '500px' }}>
        <Canvas
          camera={{ position: [80, 70, 80], fov: 45, near: 0.5, far: 2000 }}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        >
          <SceneFull
            data={terrainData}
            mode={visualizationMode}
            showAxes={showAxes}
            showGrid={showGrid}
            showContours={showContours}
            wireframe={wireframe}
            showClouds={showClouds}
            showSparkles={showSparkles}
            timeOfDay={timeOfDay}
            markers={markers}
            hover={hover}
            setHover={setHover}
            onClickTerrain={handleClickTerrain}
            controlsRef={controlsRef}
            autoRotate={autoRotate}
            onSceneReady={onSceneReady}
          />
        </Canvas>

        {/* 图例 */}
        <Legend mode={visualizationMode} theme={isDark ? 'dark' : 'light'} />

        {/* 设备图例 */}
        {showEquipment && (
          <div
            className={`absolute bottom-4 left-[185px] rounded-xl p-3 border shadow-lg backdrop-blur-md ${
              isDark
                ? 'bg-[#0a1628]/75 border-cyan-500/30'
                : 'bg-white/90 border-gray-200'
            }`}
          >
            <h4
              className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
                isDark ? 'text-cyan-300' : 'text-gray-700'
              }`}
            >
              设备
            </h4>
            <div className="space-y-1.5">
              {[
                { color: '#1a3a6a', label: '光伏面板' },
                { color: '#3d8ce8', label: '逆变器' },
                { color: '#e05040', label: '储能电池' },
                { color: '#9aa3a8', label: '变压器' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="w-4 h-3 rounded shadow-inner"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="pt-1 mt-1 border-t border-white/10">
                {[
                  { color: '#00ff88', label: '优选区域' },
                  { color: '#00d4ff', label: '良好区域' },
                  { color: '#ffcc33', label: '可用区域' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-1">
                    <span
                      className="w-4 h-3 rounded-full"
                      style={{ backgroundColor: item.color, opacity: 0.6 }}
                    />
                    <span className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 小罗盘 */}
        <div className="absolute top-4 left-4">
          <Compass2D controlsRef={controlsRef} />
        </div>

        {/* Pinned 信息面板 */}
        {pinned && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`absolute top-24 left-4 rounded-xl p-3 border shadow-xl min-w-[200px] backdrop-blur-md ${
              isDark
                ? 'bg-[#0a1628]/85 border-cyan-500/40 text-gray-200'
                : 'bg-white/90 border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                选中点信息
              </span>
              <button
                onClick={() => setPinned(null)}
                className={`text-xs ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <Row label="坐标" value={`${pinned.x.toFixed(1)}, ${pinned.z.toFixed(1)}`} />
              <Row label="海拔" value={`${(1200 + pinned.elevation).toFixed(1)} m`} />
              <Row label="坡度" value={`${pinned.slope.toFixed(2)}°`} />
              <Row label="坡向" value={`${pinned.aspect.toFixed(0)}°`} />
              <Row label="辐射" value={`${pinned.solar.toFixed(0)} W/m²`} />
              <Row
                label="适宜性"
                value={
                  <span
                    className={
                      pinned.suitability > 80
                        ? 'text-emerald-400'
                        : pinned.suitability > 60
                          ? 'text-cyan-300'
                          : pinned.suitability > 40
                            ? 'text-yellow-300'
                            : 'text-red-400'
                    }
                  >
                    {pinned.suitability.toFixed(1)}/100
                  </span>
                }
              />
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-cyan-300/80">
              {suitabilityReason(pinned)}
            </div>
          </motion.div>
        )}

        {/* 统计面板 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 w-56 space-y-2"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`rounded-lg p-3 flex items-center gap-3 border shadow-md backdrop-blur-md ${
                  isDark
                    ? 'bg-[#0a1628]/75 border-cyan-500/25'
                    : 'bg-white/90 border-gray-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-cyan-400/15' : 'bg-cyan-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[10px] uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`font-semibold text-base tabular-nums ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {stat.value}
                    <span
                      className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {stat.unit}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* 分析面板 */}
        <AnimatePresence>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-4 right-4 w-80 rounded-xl p-4 border shadow-2xl backdrop-blur-md ${
                isDark
                  ? 'bg-[#0a1628]/85 border-cyan-500/40 text-gray-200'
                  : 'bg-white/90 border-gray-200 text-gray-800'
              }`}
            >
              <h4
                className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                  isDark ? 'text-cyan-300' : 'text-cyan-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                光伏电站地形分析报告
              </h4>
              <div className="space-y-1.5 text-xs">
                <Row label="最高海拔" value={`${(1200 + terrainData.maxH).toFixed(0)} m`} />
                <Row label="最低海拔" value={`${(1200 + terrainData.minH).toFixed(0)} m`} />
                <Row label="高差" value={`${(terrainData.maxH - terrainData.minH).toFixed(1)} m`} />
                <Row label="平均坡度" value={`${stats[4].value}°`} />
                <Row label="主要地形" value={analysisData.mainTerrain} />
                <Row label="最优安装方向" value={analysisData.optimalDirection} />
                <Row
                  label="适建面积比例"
                  value={<span className="text-emerald-400">{stats[5].value}%</span>}
                />
                <Row label="主要土壤" value={analysisData.mainSoil} />
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <button
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30'
                      : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                  }`}
                >
                  生成详细 PDF 报告
                </button>
                <button
                  onClick={handleExportData}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  导出 JSON 数据
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 快捷键提示 */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border text-[10px] ${
            isDark
              ? 'bg-[#0a1628]/60 border-cyan-500/20 text-gray-400'
              : 'bg-white/80 border-gray-200 text-gray-500'
          } backdrop-blur-sm`}
        >
          鼠标拖拽旋转 · 滚轮缩放 · 点击地形选点 · <kbd className="font-mono">R</kbd> 重置 ·{' '}
          <kbd className="font-mono">G</kbd> 网格 · <kbd className="font-mono">C</kbd> 等高线 ·{' '}
          <kbd className="font-mono">W</kbd> 线框
        </div>
      </div>
    </div>
  );
}

// ===== 小辅助组件 =====
function ToolBtn({
  active,
  onClick,
  icon: Icon,
  label,
  isDark,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isDark: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className={`px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 border ${
        active
          ? isDark
            ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50'
            : 'bg-cyan-50 text-cyan-700 border-cyan-300'
          : isDark
            ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label && <span className="hidden md:inline">{label}</span>}
    </button>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
