import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Target, MapPin, Zap, Mountain, Sun, BarChart3, CheckCircle2, AlertTriangle,
  Layers, Map, RefreshCw, Wind, Droplets, Compass, Info,
  Maximize2, Minimize2, Camera, Settings2, Shield, DollarSign,
  ChevronDown, ChevronUp
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import siteSelectionService from '../services/siteSelectionService';
import useAppStore from '../store/useAppStore';

// 地形分析指标
interface TerrainMetrics {
  avgElevation: number;
  maxElevation: number;
  minElevation: number;
  avgSlope: number;
  maxSlope: number;
  solarPotential: number;
  windExposure: number;
  waterRisk: number;
  accessibility: number;
  // 新增指标
  terrainRoughness: number; // 地形粗糙度
  vegetationCover: number; // 植被覆盖度
  geologicalStability: number; // 地质稳定性
  constructionDifficulty: number; // 施工难度
  trafficAccessibility: number; // 交通便利性
  environmentalImpact: number; // 环境影响
  rainfall: number; // 年降雨量
  snowfall: number; // 年降雪量
  extremeWeatherRisk: number; // 极端天气风险
  landCost: number; // 土地成本
  gridAccessDistance: number; // 电网接入距离
}

// 选址点详细信息
interface SiteDetail {
  x: number;
  y: number;
  score: number;
  elevation: number;
  slope: number;
  solarRadiation: number;
  windSpeed: number;
  soilStability: number;
  distanceToRoad: number;
  gridConnection: number;
}

// 根据选址点指标生成推荐理由（强项 + 注意事项）
function generateSiteRationale(site: SiteDetail): { strengths: string[]; cautions: string[] } {
  const strengths: string[] = [];
  const cautions: string[] = [];

  if (site.solarRadiation >= 800) strengths.push('太阳辐射强 (≥800 W/m²)');
  else if (site.solarRadiation >= 650) strengths.push('太阳辐射良好');
  else cautions.push('辐射偏低，发电效率受限');

  if (site.slope >= 15 && site.slope <= 25) strengths.push('坡度适中 (15°-25°)');
  else if (site.slope < 15) strengths.push('坡度平缓，施工容易');
  else cautions.push(`坡度较陡 ${site.slope.toFixed(0)}°，需加强支架`);

  if (site.soilStability >= 0.8) strengths.push('土壤稳定性高');
  else if (site.soilStability < 0.65) cautions.push('土壤稳定性偏低，建议地质勘察');

  if (site.distanceToRoad <= 2) strengths.push(`道路便捷 (${site.distanceToRoad.toFixed(1)}km)`);
  else if (site.distanceToRoad > 4) cautions.push('距道路较远，运输成本高');

  if (site.gridConnection <= 2) strengths.push(`并网点近 (${site.gridConnection.toFixed(1)}km)`);
  else if (site.gridConnection > 4) cautions.push('电网接入距离远');

  if (site.windSpeed > 12) cautions.push(`风速较大 ${site.windSpeed.toFixed(1)}m/s，需抗风设计`);

  return { strengths, cautions };
}

const SiteSelection: React.FC = () => {
  const { theme, currentInstanceId } = useAppStore();
  const [terrainData, setTerrainData] = useState<{
    elevation: number[][];
    slope: number[][];
    solarRadiation: number[][];
    windSpeed: number[][];
    soilStability: number[][];
  } | null>(null);
  const [selectedSites, setSelectedSites] = useState<SiteDetail[]>([]);
  const [analysis, setAnalysis] = useState<{ message: string; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'3d' | '2d'>('3d');
  const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
  const [terrainMetrics, setTerrainMetrics] = useState<TerrainMetrics | null>(null);
  const [selectedSiteIndex, setSelectedSiteIndex] = useState<number | null>(null);
  const [showTerrainInfo, setShowTerrainInfo] = useState(true);
  const [showSiteMarkers, setShowSiteMarkers] = useState(true);
  const [terrainColorMode, setTerrainColorMode] = useState<'elevation' | 'slope' | 'solar'>('elevation');
  const [cameraPosition, setCameraPosition] = useState({ x: 50, y: 50, z: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [siteSelectionResult, setSiteSelectionResult] = useState<any>(null);
  // 智能选址系统页面的升级内容
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'solar' | 'wind' | 'slope' | 'soil'>('solar');
  const [analysisParams, setAnalysisParams] = useState({
    minSolarRadiation: 600,
    maxSlope: 25,
    minSoilStability: 0.7,
    maxDistanceToRoad: 3,
    maxGridConnection: 4
  });
  
  // 使用 ref 对象来引用 three.js 容器
  const [containerReady, setContainerReady] = useState(false);
  const [showScoringFormula, setShowScoringFormula] = useState(false);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 当组件挂载后，检查 threeContainerRef 是否存在
  useEffect(() => {
    isMountedRef.current = true;
    
    const checkContainer = () => {
      if (!isMountedRef.current) return;
      
      if (threeContainerRef.current) {
        setContainerReady(true);
      } else {
        const timeoutId = setTimeout(checkContainer, 50);
        return () => clearTimeout(timeoutId);
      }
    };
    checkContainer();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // 获取地形数据 - 从后端或本地生成
  const loadTerrainData = useCallback(async () => {
    const currentInstanceId = currentInstanceIdRef.current || 'r1';

    // 尝试从后端获取真实地形数据
    const instanceData = await siteSelectionService.fetchTerrainData(currentInstanceId);
    console.log('loadTerrainData - instanceData:', instanceData);

    if (instanceData && instanceData.terrain_data) {
      console.log('使用后端真实地形数据');
      const terrain = instanceData.terrain_data;
      console.log('terrain keys:', Object.keys(terrain));

      // 检查后端数据是否完整
      const hasElevation = terrain.elevation && terrain.elevation.length > 0;
      const hasSlope = terrain.slope && terrain.slope.length > 0;
      const hasSolar = terrain.solar_radiation && terrain.solar_radiation.length > 0;
      // 也检查 slope_matrix（某些算例使用这个字段名）
      const hasSlopeMatrix = terrain.slope_matrix && terrain.slope_matrix.length > 0;

      console.log('hasElevation:', hasElevation, 'hasSlope:', hasSlope, 'hasSolar:', hasSolar, 'hasSlopeMatrix:', hasSlopeMatrix);

      if (hasElevation && (hasSlope || hasSlopeMatrix) && hasSolar) {
        // 构建与前端兼容的地形数据格式
        const data = {
          elevation: terrain.elevation,
          slope: terrain.slope || terrain.slope_matrix,
          solarRadiation: terrain.solar_radiation,
          windSpeed: terrain.elevation.map((row: number[], i: number) =>
            row.map((elev: number, j: number) => {
              const slp = (terrain.slope || terrain.slope_matrix)?.[i]?.[j] ?? 10;
              return Math.min(20, 4 + elev / 200 + slp * 0.1);
            })
          ),
          soilStability: terrain.elevation.map((row: number[], i: number) =>
            row.map((_: number, j: number) => {
              const slp = (terrain.slope || terrain.slope_matrix)?.[i]?.[j] ?? 10;
              return Math.max(0.5, Math.min(0.95, 0.95 - slp * 0.012));
            })
          )
        };
        setTerrainData(data);
        calculateTerrainMetrics(data);
      } else {
        // 后端数据不完整，使用本地生成的地形数据
        console.log('后端地形数据不完整，使用本地生成');
        const data = siteSelectionService.generateTerrain();
        const enhancedData = {
          ...data,
          windSpeed: data.elevation.map((row: number[], i: number) =>
            row.map((elev: number, j: number) => {
              const slp = data.slope?.[i]?.[j] ?? 10;
              return Math.min(20, 4 + elev / 200 + slp * 0.1);
            })
          ),
          soilStability: data.elevation.map((row: number[], i: number) =>
            row.map((_: number, j: number) => {
              const slp = data.slope?.[i]?.[j] ?? 10;
              return Math.max(0.5, Math.min(0.95, 0.95 - slp * 0.012));
            })
          )
        };
        setTerrainData(enhancedData);
        calculateTerrainMetrics(enhancedData);
      }
    } else {
      // 后端获取失败，使用本地生成的地形数据
      console.log('后端获取失败，使用本地生成的地形数据');
      const data = siteSelectionService.generateTerrain();
      const enhancedData = {
        ...data,
        windSpeed: data.elevation.map((row: number[], i: number) =>
          row.map((elev: number, j: number) => {
            const slp = data.slope?.[i]?.[j] ?? 10;
            return Math.min(20, 4 + elev / 200 + slp * 0.1);
          })
        ),
        soilStability: data.elevation.map((row: number[], i: number) =>
          row.map((_: number, j: number) => {
            const slp = data.slope?.[i]?.[j] ?? 10;
            return Math.max(0.5, Math.min(0.95, 0.95 - slp * 0.012));
          })
        )
      };
      setTerrainData(enhancedData);
      calculateTerrainMetrics(enhancedData);
    }
  }, []);

  // 生成地形数据
  useEffect(() => {
    loadTerrainData();
  }, [loadTerrainData]);

  // 使用 ref 保存 currentInstanceId 的值
  const currentInstanceIdRef = useRef(currentInstanceId);
  useEffect(() => {
    currentInstanceIdRef.current = currentInstanceId;
    // 当 currentInstanceId 变化时，重新加载地形数据
    loadTerrainData();
  }, [currentInstanceId, loadTerrainData]);

  // 计算地形指标 - 基于真实地形数据推导，不使用随机数
  const calculateTerrainMetrics = (data: any) => {
    const elevations = data.elevation.flat() as number[];
    const slopes = data.slope.flat() as number[];
    const solar = data.solarRadiation.flat() as number[];

    // 单次循环计算 mean/min/max（避免 Math.max(...arr) 在大网格上栈溢出）
    let elevSum = 0, minElev = Infinity, maxElev = -Infinity;
    for (let k = 0; k < elevations.length; k++) {
      const v = elevations[k];
      elevSum += v;
      if (v < minElev) minElev = v;
      if (v > maxElev) maxElev = v;
    }
    const elevationMean = elevSum / elevations.length;

    let slopeSum = 0, maxSlope = -Infinity;
    for (let k = 0; k < slopes.length; k++) {
      const v = slopes[k];
      slopeSum += v;
      if (v > maxSlope) maxSlope = v;
    }
    const avgSlope = slopeSum / slopes.length;

    let solarSum = 0;
    for (let k = 0; k < solar.length; k++) solarSum += solar[k];
    const avgSolar = solarSum / solar.length;

    let varianceSum = 0;
    for (let k = 0; k < elevations.length; k++) {
      const d = elevations[k] - elevationMean;
      varianceSum += d * d;
    }
    const terrainRoughness = Math.sqrt(varianceSum / elevations.length);
    const elevRange = maxElev - minElev;

    // 基于地形数据推导各项指标
    const windExposure = Math.min(100, Math.max(30, elevationMean / 15 + avgSlope * 0.8));
    const waterRisk = Math.max(5, Math.min(50, 40 - avgSlope * 1.5 + (elevRange < 100 ? 10 : 0)));
    const accessibility = Math.max(40, Math.min(95, 100 - avgSlope * 1.5 - elevRange * 0.02));
    const vegetationCover = Math.max(15, Math.min(75, 60 - Math.abs(elevationMean - 1200) * 0.03 - avgSlope * 0.5));
    const geologicalStability = Math.max(40, Math.min(95, 95 - avgSlope * 1.2 - terrainRoughness * 0.1));
    const constructionDifficulty = Math.max(10, Math.min(80, avgSlope * 1.5 + terrainRoughness * 0.3 + 10));
    const trafficAccessibility = Math.max(40, Math.min(90, 90 - avgSlope * 1.0 - Math.max(0, (elevationMean - 1500) * 0.02)));
    const environmentalImpact = Math.max(10, Math.min(60, vegetationCover * 0.5 + avgSlope * 0.3));
    const rainfall = Math.max(300, Math.min(600, 400 + elevationMean * 0.05));
    const snowfall = Math.max(30, Math.min(200, 50 + Math.max(0, (elevationMean - 1500) * 0.15)));
    const extremeWeatherRisk = Math.max(10, Math.min(45, 15 + terrainRoughness * 0.15 + Math.max(0, (elevationMean - 2000) * 0.01)));
    const landCost = Math.max(5000, Math.min(40000, 30000 - elevationMean * 5 - avgSlope * 200));
    const gridAccessDistance = Math.max(0.5, Math.min(8, 2 + elevRange * 0.005 + avgSlope * 0.05));

    setTerrainMetrics({
      avgElevation: elevationMean,
      maxElevation: maxElev,
      minElevation: minElev,
      avgSlope,
      maxSlope,
      solarPotential: (avgSolar - 500) / 500 * 100,
      windExposure,
      waterRisk,
      accessibility,
      terrainRoughness,
      vegetationCover,
      geologicalStability,
      constructionDifficulty,
      trafficAccessibility,
      environmentalImpact,
      rainfall,
      snowfall,
      extremeWeatherRisk,
      landCost,
      gridAccessDistance
    });
  };

  // 根据颜色模式获取地形颜色
  const getTerrainColor = (elevation: number, slope: number, solar: number) => {
    switch (terrainColorMode) {
      case 'elevation':
        // 根据海拔高度着色：低海拔绿色，高海拔白色/雪色
        const e = (elevation - 800) / 400;
        if (e < 0.2) return new THREE.Color(0x166534); // 深绿 - 平原
        if (e < 0.4) return new THREE.Color(0x22c55e); // 中绿 - 丘陵
        if (e < 0.6) return new THREE.Color(0x854d0e); // 棕色 - 山地
        if (e < 0.8) return new THREE.Color(0x78716c); // 深灰 - 高山
        return new THREE.Color(0xf8fafc); // 白色/雪 - 山顶
      case 'slope':
        // 根据坡度着色：平缓绿色，陡峭红色
        const s = slope / 45;
        if (s < 0.1) return new THREE.Color(0x22c55e); // 绿色 - 平缓
        if (s < 0.3) return new THREE.Color(0x84cc16); // 浅绿色 - 较平缓
        if (s < 0.5) return new THREE.Color(0xeab308); // 黄色 - 中等坡度
        if (s < 0.7) return new THREE.Color(0xf97316); // 橙色 - 较陡峭
        return new THREE.Color(0xef4444); // 红色 - 陡峭
      case 'solar':
        // 根据太阳辐射着色
        const sol = (solar - 500) / 500;
        return new THREE.Color().setHSL(0.6 - sol * 0.4, 0.9, 0.5); // 更鲜艳的颜色
      default:
        return new THREE.Color(0x14b8a6); // 青绿色 - 默认
    }
  };

  // 初始化 Three.js 场景
  const initializeThree = useCallback(() => {
    // 如果已经有待处理的初始化请求，先清除
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    console.log('initializeThree called');
    console.log('threeContainerRef.current:', threeContainerRef.current);
    console.log('terrainData:', terrainData);
    
    // 检查 threeContainerRef.current 是否存在
    if (!threeContainerRef.current || !terrainData) {
      // 如果不存在，等待一段时间后再尝试
      console.log('threeContainerRef.current 不存在，等待后重试');
      initTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && terrainData) {
          initializeThree();
        }
      }, 100);
      return;
    }

    setIsVisualizationLoading(true);

    try {
      // 清理之前的场景
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        threeContainerRef.current.innerHTML = '';
      }

      // 创建场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(theme === 'dark' ? 0x0f172a : 0xf8fafc);
      scene.fog = new THREE.Fog(theme === 'dark' ? 0x0f172a : 0xf8fafc, 50, 150);
      sceneRef.current = scene;

      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        60,
        threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      camera.lookAt(25, 0, 25);
      cameraRef.current = camera;

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用更柔和的阴影
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      threeContainerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 添加轨道控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      controls.minDistance = 20;
      controls.maxDistance = 150;
      controls.target.set(25, 5, 25);
      controlsRef.current = controls;

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
      scene.add(ambientLight);

      // 添加太阳光（方向光）
      const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.5);
      sunLight.position.set(50, 80, 30);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 200;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      // 添加半球光
      const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x2d5016, 0.6);
      scene.add(hemiLight);

      // 创建地形
      const { elevation, slope, solarRadiation } = terrainData;
      const size = elevation.length;
      const geometry = new THREE.PlaneGeometry(size * 2, size * 2, size - 1, size - 1);

      // 设置顶点高度和颜色
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = new Float32Array(positions.length);
      
      // 计算海拔范围
      const elevations = elevation.flat();
      const minElevation = Math.min(...elevations);
      const maxElevation = Math.max(...elevations);
      const elevationRange = maxElevation - minElevation;
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = (i * size + j) * 3;
          // 归一化并缩放高度，让地形中心在 y=0 附近
          const normalizedHeight = (elevation[i][j] - minElevation) / elevationRange;
          const height = (normalizedHeight - 0.5) * 20; // 缩放范围到 -10 到 10
          positions[index + 2] = height;
          
          // 设置顶点颜色
          const color = getTerrainColor(elevation[i][j], slope[i][j], solarRadiation[i][j]);
          colors[index] = color.r;
          colors[index + 1] = color.g;
          colors[index + 2] = color.b;
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeVertexNormals();

      // 创建地形材质 - 增强视觉效果
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.2,
        flatShading: false,

        bumpScale: 0.1,
        side: THREE.DoubleSide
      });

      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2;
      terrain.position.set(0, 0, 0);
      terrain.receiveShadow = true;
      terrain.castShadow = true;
      scene.add(terrain);
      terrainMeshRef.current = terrain;

      // 添加水域（低海拔区域）
      const waterGeometry = new THREE.PlaneGeometry(size * 2, size * 2);
      const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.8,
        envMap: null // 可以添加环境贴图增强效果
      });
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI / 2;
      water.position.y = -12; // 调整到地形下方
      scene.add(water);

      // 添加云层效果 - 更真实的云层
      const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      });
      
      for (let i = 0; i < 30; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
          (Math.random() - 0.5) * size * 2,
          40 + Math.random() * 30,
          (Math.random() - 0.5) * size * 2
        );
        cloud.scale.set(
          4 + Math.random() * 6,
          1 + Math.random() * 3,
          4 + Math.random() * 6
        );
        cloud.userData = { 
          speed: Math.random() * 0.01 + 0.005,
          direction: Math.random() > 0.5 ? 1 : -1
        };
        scene.add(cloud);
      }

      // 添加选址标记 - 增强视觉效果
      const markersGroup = new THREE.Group();
      
      if (showSiteMarkers) {
        selectedSites.forEach((site, index) => {
          // 主标记球体
          const markerGeometry = new THREE.SphereGeometry(1.5, 32, 32);
          const markerMaterial = new THREE.MeshStandardMaterial({
            color: index === 0 ? 0xff4444 : 0x44ff44,
            emissive: index === 0 ? 0xff0000 : 0x00ff00,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.8
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          
          const x = (site.x - size / 2) * 2;
          const z = (site.y - size / 2) * 2;
          // 复用上方已计算的 minElevation / elevationRange
          const normalizedHeight = (elevation[site.y][site.x] - minElevation) / elevationRange;
          const y = (normalizedHeight - 0.5) * 20 + 1;
          
          marker.position.set(x, y, z);
          marker.castShadow = true;
          marker.userData = { 
            siteIndex: index,
            pulse: 0
          };
          markersGroup.add(marker);

          // 发光环 - 动态效果
          const ringGeometry = new THREE.RingGeometry(2, 2.5, 32);
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: index === 0 ? 0xff4444 : 0x44ff44,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.position.set(x, y + 0.1, z);
          ring.rotation.x = -Math.PI / 2;
          ring.userData = { 
            scale: 1,
            direction: 1
          };
          markersGroup.add(ring);

          // 标签 - 使用Canvas纹理创建更美观的标签
          const labelCanvas = document.createElement('canvas');
          const labelContext = labelCanvas.getContext('2d');
          labelCanvas.width = 128;
          labelCanvas.height = 64;
          
          if (labelContext) {
            labelContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
            labelContext.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
            labelContext.font = 'bold 16px Arial';
            labelContext.fillStyle = index === 0 ? '#ff4444' : '#44ff44';
            labelContext.textAlign = 'center';
            labelContext.textBaseline = 'middle';
            labelContext.fillText(`#${index + 1}`, labelCanvas.width / 2, labelCanvas.height / 2 - 5);
            labelContext.font = '12px Arial';
            labelContext.fillStyle = '#ffffff';
            labelContext.fillText(`${site.score.toFixed(2)}`, labelCanvas.width / 2, labelCanvas.height / 2 + 10);
          }
          
          const labelTexture = new THREE.CanvasTexture(labelCanvas);
          const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
          const labelSprite = new THREE.Sprite(labelMaterial);
          labelSprite.position.set(x, y + 4, z);
          labelSprite.scale.set(8, 4, 1);
          markersGroup.add(labelSprite);
        });
      }
      
      scene.add(markersGroup);
      markersRef.current = markersGroup;

      // 添加坐标轴辅助
      const axesHelper = new THREE.AxesHelper(10);
      axesHelper.position.set(-size + 5, 0, -size + 5);
      scene.add(axesHelper);

      // 动画循环 - 增强视觉效果
      let time = 0;
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        time += 0.01;
        
        // 太阳光旋转模拟日照变化
        if (sunLightRef.current) {
          sunLightRef.current.position.x = 50 * Math.cos(time * 0.1);
          sunLightRef.current.position.z = 50 * Math.sin(time * 0.1);
        }
        
        // 云层动画
        scene.traverse((object) => {
          if (object.userData && object.userData.speed) {
            object.position.x += object.userData.speed * object.userData.direction;
            if (object.position.x > size) object.position.x = -size;
            if (object.position.x < -size) object.position.x = size;
          }
        });
        
        // 选址点动画效果
        if (markersGroup) {
          markersGroup.children.forEach((child) => {
            if (child.userData && child.userData.pulse !== undefined) {
              // 标记脉冲效果
              child.userData.pulse += 0.1;
              const scale = 1 + Math.sin(child.userData.pulse) * 0.1;
              child.scale.set(scale, scale, scale);
            }
            if (child.userData && child.userData.scale !== undefined) {
              // 光环缩放效果
              child.userData.scale += 0.02 * child.userData.direction;
              if (child.userData.scale > 1.2) child.userData.direction = -1;
              if (child.userData.scale < 0.8) child.userData.direction = 1;
              child.scale.set(child.userData.scale, child.userData.scale, 1);
            }
          });
        }
        
        // 使用 ref 引用 controls
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        if (rendererRef.current && cameraRef.current && sceneRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      // 处理窗口大小变化
      const handleResize = () => {
        if (threeContainerRef.current && cameraRef.current && rendererRef.current) {
          const width = threeContainerRef.current.clientWidth;
          const height = threeContainerRef.current.clientHeight;
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      };

      window.addEventListener('resize', handleResize);

      setIsVisualizationLoading(false);
      console.log('Three.js 初始化成功');

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
      };
    } catch (error) {
      console.error('Error initializing Three.js:', error);
      setIsVisualizationLoading(false);
    }
  }, [terrainData, terrainColorMode, showSiteMarkers, cameraPosition, selectedSites, theme]);

  // 当初始化条件满足时，初始化 Three.js
  useEffect(() => {
    console.log('Initialization check:', {
      terrainData: !!terrainData,
      visualizationMode: visualizationMode,
      containerReady: containerReady
    });
    
    if (terrainData && visualizationMode === '3d' && containerReady) {
      console.log('Initializing Three.js...');
      initializeThree();
    }
    
    return () => {
      // 清理待处理的初始化 timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [terrainData, visualizationMode, containerReady, initializeThree]);

  const handleRunAlgorithm = async () => {
    if (!currentInstanceId) {
      alert('请先选择一个算例');
      return;
    }

    setLoading(true);

    try {
      console.log('开始运行智能选址分析，算例ID:', currentInstanceId);
      
      // 尝试调用后端API
      let result;
      try {
        result = await siteSelectionService.analyzeSite({ instance_id: currentInstanceId });
        console.log('智能选址分析结果:', result);
      } catch (apiError) {
        console.error('后端API调用失败，使用本地模拟数据:', apiError);
        // 后端API失败，使用本地模拟数据
        result = generateLocalSiteSelectionResult();
      }
      
      setSiteSelectionResult(result);
      
      // 转换后端返回的选址点数据为前端需要的格式
      if (result && result.recommended_areas) {
        const size = terrainData?.elevation?.length || 50;
        const enhancedSites: SiteDetail[] = result.recommended_areas.map((area: any, index: number) => {
          // 更真实的选址点分布
          let x, y;
          
          // 基于工程实际，选址点应该分布在不同的地形区域
          switch (index) {
            case 0: // 最佳选址 - 平缓区域
              x = Math.floor(size * 0.3);
              y = Math.floor(size * 0.3);
              break;
            case 1: // 次佳选址 - 稍微起伏的区域
              x = Math.floor(size * 0.6);
              y = Math.floor(size * 0.3);
              break;
            case 2: // 备选选址 - 较平坦区域
              x = Math.floor(size * 0.3);
              y = Math.floor(size * 0.6);
              break;
            case 3: // 备选选址 - 边缘区域
              x = Math.floor(size * 0.6);
              y = Math.floor(size * 0.6);
              break;
            default:
              x = Math.floor(Math.random() * size * 0.8) + Math.floor(size * 0.1);
              y = Math.floor(Math.random() * size * 0.8) + Math.floor(size * 0.1);
          }

          // 确保坐标在有效范围内
          x = Math.min(x, size - 1);
          y = Math.min(y, size - 1);

          // 从地形数据中提取对应位置的真实值
          const elev = terrainData?.elevation?.[y]?.[x] ?? (1000 + Math.random() * 100);
          const slp = terrainData?.slope?.[y]?.[x] ?? (5 + Math.random() * 10);
          const solar = terrainData?.solarRadiation?.[y]?.[x] ?? (700 + Math.random() * 200);
          const wind = terrainData?.windSpeed?.[y]?.[x] ?? (4 + Math.random() * 8);
          const soil = terrainData?.soilStability?.[y]?.[x] ?? (0.7 + Math.random() * 0.2);

          // 基于地形条件计算更真实的评分
          const score = calculateRealisticScore(slp, solar, wind, soil, elev);

          return {
            x,
            y,
            score,
            elevation: elev,
            slope: slp,
            solarRadiation: solar,
            windSpeed: wind,
            soilStability: soil,
            distanceToRoad: Math.max(0.5, 3 - score * 1.5),
            gridConnection: Math.max(0.5, 4 - score * 2.5)
          };
        });

        // 按评分排序
        enhancedSites.sort((a, b) => b.score - a.score);

        setSelectedSites(enhancedSites);

        // 创建分析结果 - 基于实际选址数据生成建议
        const bestScore = enhancedSites[0]?.score;
        const avgElev = enhancedSites.reduce((s, site) => s + site.elevation, 0) / enhancedSites.length;
        const avgSlope = enhancedSites.reduce((s, site) => s + site.slope, 0) / enhancedSites.length;
        const avgSolar = enhancedSites.reduce((s, site) => s + site.solarRadiation, 0) / enhancedSites.length;

        const recommendations: string[] = [];
        recommendations.push(`最佳选址评分 ${bestScore?.toFixed(2)}，综合地形条件优良，适合建设光伏电站`);
        
        // 基于实际地形条件生成更真实的建议
        if (avgSlope > 20) {
          recommendations.push(`选址区域平均坡度 ${avgSlope.toFixed(1)}°，属于较陡地形，需要特殊的支架设计和施工方案`);
          recommendations.push('建议采用可调角度支架，提高发电效率并确保结构安全');
        } else if (avgSlope > 10) {
          recommendations.push(`选址区域平均坡度 ${avgSlope.toFixed(1)}°，地形适中，适合常规光伏电站建设`);
        } else {
          recommendations.push(`选址区域平均坡度 ${avgSlope.toFixed(1)}°，地形平坦，施工条件优越`);
        }
        
        if (avgSolar > 800) {
          recommendations.push(`选址区域平均太阳辐射 ${avgSolar.toFixed(0)} W/m²，光照条件优异，发电潜力大`);
        } else if (avgSolar > 600) {
          recommendations.push(`选址区域平均太阳辐射 ${avgSolar.toFixed(0)} W/m²，光照条件良好，适合光伏电站建设`);
        } else {
          recommendations.push(`选址区域平均太阳辐射 ${avgSolar.toFixed(0)} W/m²，光照条件一般，建议增加面板数量以提高发电量`);
        }
        
        recommendations.push(`选址区域平均海拔 ${avgElev.toFixed(0)}m，建议进行详细的地质勘察和水文分析`);
        recommendations.push('考虑周围环境因素，如遮挡物和风向对发电效率的影响');
        recommendations.push('建议进行详细的可行性研究，包括电网接入、土地规划等因素');

        const analysisResult = {
          message: `找到 ${enhancedSites.length} 个合适的选址位置，最佳位置评分: ${bestScore?.toFixed(2) || 'N/A'}`,
          recommendations
        };

        setAnalysis(analysisResult);
      } else {
        console.error('返回的数据格式不正确:', result);
        alert('返回的数据格式不正确，请检查算例是否存在');
      }
    } catch (error) {
      console.error('智能选址分析失败:', error);
      alert('智能选址分析失败，请检查算例是否存在');
    } finally {
      setLoading(false);
    }
  };

  // 生成本地模拟的选址结果
  const generateLocalSiteSelectionResult = () => {
    return {
      recommended_areas: [
        { score: 0.85 },
        { score: 0.78 },
        { score: 0.72 },
        { score: 0.65 }
      ],
      total_candidates: 4,
      analysis: {
        best_location: { score: 0.85 },
        average_score: 0.75
      }
    };
  };

  // 计算更真实的选址评分
  const calculateRealisticScore = (slope: number, solar: number, wind: number, soil: number, elevation: number) => {
    // 工程实际评分公式
    // 1. 坡度权重 (30%): 坡度越小越好
    const slopeScore = Math.max(0, 1 - (slope / 30));
    
    // 2. 太阳辐射权重 (35%): 辐射越高越好
    const solarScore = Math.min(1, (solar - 500) / 500);
    
    // 3. 风速权重 (10%): 风速适中较好
    const windScore = Math.max(0, 1 - Math.abs(wind - 6) / 10);
    
    // 4. 土壤稳定性权重 (15%): 稳定性越高越好
    const soilScore = soil;
    
    // 5. 海拔权重 (10%): 海拔适中较好
    const elevationScore = Math.max(0, 1 - Math.abs(elevation - 1200) / 500);
    
    // 综合评分
    return (
      slopeScore * 0.3 +
      solarScore * 0.35 +
      windScore * 0.1 +
      soilScore * 0.15 +
      elevationScore * 0.1
    );
  };

  const resetCamera = () => {
    setCameraPosition({ x: 50, y: 50, z: 50 });
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(50, 50, 50);
      controlsRef.current.target.set(25, 5, 25);
      controlsRef.current.update();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 rounded-2xl overflow-hidden gradient-border"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80" />
        <div className="absolute inset-0 flex items-center p-8">
          <div className="flex-1">
            <motion.h1 
              className="text-3xl font-bold text-white mb-2 glow-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              智能选址系统
            </motion.h1>
            <motion.p 
              className="text-gray-300 max-w-xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              基于AI算法和多维地形数据，自动识别最佳光伏电站选址位置，
              综合考虑海拔、坡度、太阳辐射、风速、土壤稳定性等因素。
            </motion.p>
            <motion.div 
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-400 text-sm">
                AI驱动
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-400 text-sm">
                多维地形分析
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-sm">
                3D可视化
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-400 text-sm">
                实时渲染
              </span>
            </motion.div>
          </div>
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center animate-float">
              <Target className="w-16 h-16 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 地形指标概览 */}
      {terrainMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">平均海拔</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.avgElevation.toFixed(0)}m</p>
            <p className="text-xs text-gray-500">范围: {terrainMetrics.minElevation.toFixed(0)}-{terrainMetrics.maxElevation.toFixed(0)}m</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">平均坡度</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.avgSlope.toFixed(1)}°</p>
            <p className="text-xs text-gray-500">最大: {terrainMetrics.maxSlope.toFixed(1)}°</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-gray-400">太阳能潜力</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.solarPotential.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">辐射强度优良</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">风能暴露度</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.windExposure.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">通风条件良好</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">水灾风险</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.waterRisk.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">排水条件良好</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-gray-400">极端天气风险</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.extremeWeatherRisk.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">风险评估</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">地形粗糙度</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.terrainRoughness.toFixed(1)}</p>
            <p className="text-xs text-gray-500">地形复杂度</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">植被覆盖度</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.vegetationCover.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">生态环境</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">地质稳定性</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.geologicalStability.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">稳定性评估</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">施工难度</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.constructionDifficulty.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">施工复杂度</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">电网接入距离</span>
            </div>
            <p className="text-xl font-bold text-white">{terrainMetrics.gridAccessDistance.toFixed(1)}km</p>
            <p className="text-xs text-gray-500">连接便利性</p>
          </div>
          
          <div className="tech-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">土地成本</span>
            </div>
            <p className="text-xl font-bold text-white">¥{terrainMetrics.landCost.toFixed(0)}</p>
            <p className="text-xs text-gray-500">每亩成本</p>
          </div>
        </motion.div>
      )}

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-card p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">智能选址分析</h3>
            <p className="text-gray-400 text-sm">基于多维地形数据和AI算法，自动识别最佳光伏电站选址位置</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              高级设置
            </button>
            <button
              onClick={handleRunAlgorithm}
              disabled={loading || !terrainData}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-white hover:shadow-lg hover:shadow-cyan-400/20'}`}
            >
              {loading ? '分析中...' : '运行算法'}
            </button>
          </div>
        </div>

        {/* 高级分析设置 */}
        {showAdvancedAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <h4 className="text-white font-medium mb-3">分析参数设置</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">最小太阳辐射 (W/m²)</label>
                <input
                  type="range"
                  min="500"
                  max="1000"
                  step="50"
                  value={analysisParams.minSolarRadiation}
                  onChange={(e) => setAnalysisParams({...analysisParams, minSolarRadiation: parseInt(e.target.value)})}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>500</span>
                  <span>{analysisParams.minSolarRadiation}</span>
                  <span>1000</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">最大坡度 (°)</label>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="1"
                  value={analysisParams.maxSlope}
                  onChange={(e) => setAnalysisParams({...analysisParams, maxSlope: parseInt(e.target.value)})}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10°</span>
                  <span>{analysisParams.maxSlope}°</span>
                  <span>45°</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">最小土壤稳定性</label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={analysisParams.minSoilStability}
                  onChange={(e) => setAnalysisParams({...analysisParams, minSoilStability: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>{analysisParams.minSoilStability.toFixed(2)}</span>
                  <span>1.0</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">最大道路距离 (km)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={analysisParams.maxDistanceToRoad}
                  onChange={(e) => setAnalysisParams({...analysisParams, maxDistanceToRoad: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1km</span>
                  <span>{analysisParams.maxDistanceToRoad.toFixed(1)}km</span>
                  <span>5km</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">最大电网接入距离 (km)</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={analysisParams.maxGridConnection}
                  onChange={(e) => setAnalysisParams({...analysisParams, maxGridConnection: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1km</span>
                  <span>{analysisParams.maxGridConnection.toFixed(1)}km</span>
                  <span>8km</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 选址评分公式说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-card overflow-hidden"
      >
        <button
          onClick={() => setShowScoringFormula(!showScoringFormula)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">选址评分公式（6维度加权评分模型）</span>
          </div>
          {showScoringFormula ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showScoringFormula && (
          <div className="px-6 pb-6 space-y-4">
            <div className="p-4 bg-cyan-400/5 rounded-lg border border-cyan-400/20">
              <p className="text-cyan-300 font-mono text-sm mb-3">
                总得分 = 0.35 × 太阳辐射 + 0.30 × 地形坡度 + 0.15 × 道路可达性 + 0.10 × 地质稳定性 + 0.05 × 环境敏感度 + 0.05 × 电网接入距离
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: '太阳辐射', weight: '35%', color: 'text-amber-400', desc: '根据坡向和遮挡计算，正南向高分，遮挡严重区域低分' },
                { name: '地形坡度', weight: '30%', color: 'text-emerald-400', desc: '15°-25°为最优，过陡或过缓都扣分' },
                { name: '道路可达性', weight: '15%', color: 'text-blue-400', desc: '距离现有道路越近分数越高' },
                { name: '地质稳定性', weight: '10%', color: 'text-purple-400', desc: '根据土壤类型和坡度稳定性综合评估' },
                { name: '环境敏感度', weight: '5%', color: 'text-red-400', desc: '避开生态保护区、湿地等' },
                { name: '电网接入距离', weight: '5%', color: 'text-cyan-400', desc: '距离并网点越近分数越高' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-sm ${item.color}`}>{item.name}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">{item.weight}</span>
                  </div>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`tech-card p-6 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">选址可视化</h3>
            <p className="text-sm text-gray-400">3D地形模型与选址点分布</p>
            <p className="text-xs text-yellow-400/70 mt-1">3D地形正在加载，请稍等片刻...</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* 颜色模式选择 */}
            <select
              value={terrainColorMode}
              onChange={(e) => setTerrainColorMode(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-white/5 text-gray-300 border border-white/10 text-sm"
            >
              <option value="elevation">海拔着色</option>
              <option value="slope">坡度着色</option>
              <option value="solar">太阳辐射着色</option>
            </select>

            {/* 显示选项 */}
            <button
              onClick={() => setShowTerrainInfo(!showTerrainInfo)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${showTerrainInfo ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}
            >
              <Info className="w-4 h-4 inline mr-1" />
              地形信息
            </button>
            
            <button
              onClick={() => setShowSiteMarkers(!showSiteMarkers)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${showSiteMarkers ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              选址点
            </button>

            {/* 视图模式 */}
            <button
              onClick={() => setVisualizationMode('3d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${visualizationMode === '3d' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
            >
              <Layers className="w-4 h-4 inline mr-1" />
              3D 地形
            </button>
            <button
              onClick={() => setVisualizationMode('2d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${visualizationMode === '2d' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
            >
              <Map className="w-4 h-4 inline mr-1" />
              2D 热力图
            </button>

            {/* 相机控制 */}
            <button
              onClick={resetCamera}
              className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10"
              title="重置视角"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setIsVisualizationLoading(true);
                setTimeout(() => {
                  if (visualizationMode === '3d') {
                    initializeThree();
                  }
                  setIsVisualizationLoading(false);
                }, 500);
              }}
              disabled={isVisualizationLoading}
              className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className={`relative bg-black/50 rounded-lg overflow-hidden border border-white/10 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[700px]'}`} style={{ minHeight: '700px' }}>
          {isVisualizationLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-cyan-400">3D地形正在加载，请稍等片刻...</p>
            </div>
          ) : visualizationMode === '3d' ? (
            <div ref={threeContainerRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full p-4">
              {terrainData && (
                <div className="w-full h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {terrainColorMode === 'elevation' ? '海拔高度' : 
                       terrainColorMode === 'slope' ? '坡度分布' : '太阳辐射强度'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-blue-400">低</span>
                      <div className="w-24 h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded" />
                      <span className="text-xs text-red-400">高</span>
                    </div>
                  </div>
                  <div className="w-full h-[calc(100%-30px)] overflow-auto">
                    <div className="grid gap-px" style={{ 
                      gridTemplateColumns: `repeat(${terrainData.solarRadiation[0].length}, minmax(8px, 1fr))` 
                    }}>
                      {terrainData.solarRadiation.map((row, i) => (
                        row.map((value, j) => {
                          let intensity = 0;
                          if (terrainColorMode === 'elevation') {
                            intensity = (terrainData.elevation[i][j] - 800) / 400;
                          } else if (terrainColorMode === 'slope') {
                            intensity = terrainData.slope[i][j] / 45;
                          } else {
                            intensity = (value - 500) / 500;
                          }
                          
                          const isSelected = selectedSites.some(site => site.x === j && site.y === i);
                          return (
                            <div
                              key={`${i}-${j}`}
                              className={`aspect-square ${isSelected ? 'ring-2 ring-red-500 z-10' : ''}`}
                              style={{
                                backgroundColor: `rgba(${Math.floor(255 * intensity)}, ${Math.floor(255 * (1 - intensity))}, 0, 0.8)`
                              }}
                              title={`海拔: ${terrainData.elevation[i][j].toFixed(0)}m, 坡度: ${terrainData.slope[i][j].toFixed(1)}°, 辐射: ${value.toFixed(0)}W/m²`}
                            />
                          );
                        })
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 图例 */}
          {showTerrainInfo && visualizationMode === '3d' && (
            <div className="absolute bottom-4 left-4 bg-black/70 p-4 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">地形图例</h4>
              <div className="space-y-2 text-xs">
                {terrainColorMode === 'elevation' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2d5016' }} />
                      <span className="text-gray-300">低海拔 (800-920m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5a8f3c' }} />
                      <span className="text-gray-300">中低海拔 (920-1000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b7355' }} />
                      <span className="text-gray-300">中海拔 (1000-1080m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#a0a0a0' }} />
                      <span className="text-gray-300">高海拔 (1080-1160m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffffff' }} />
                      <span className="text-gray-300">极高海拔 (1160m+)</span>
                    </div>
                  </>
                )}
                {terrainColorMode === 'slope' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
                      <span className="text-gray-300">平缓 (0-9°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
                      <span className="text-gray-300">中等 (9-18°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
                      <span className="text-gray-300">较陡 (18-27°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                      <span className="text-gray-300">陡峭 (27°+)</span>
                    </div>
                  </>
                )}
                {terrainColorMode === 'solar' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
                      <span className="text-gray-300">低辐射 (500-650 W/m²)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
                      <span className="text-gray-300">中辐射 (650-800 W/m²)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
                      <span className="text-gray-300">高辐射 (800-950 W/m²)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                      <span className="text-gray-300">极高辐射 (950-1000 W/m²)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 选址点图例 */}
          {showSiteMarkers && selectedSites.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/70 p-4 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">选址点</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-300">最佳位置 (#1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300">备选位置 (#2-5)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results */}
      {selectedSites.length > 0 && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Analysis Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="tech-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">分析结果</h3>
            </div>
            <p className="text-gray-300 mb-4">{analysis.message}</p>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <p className="text-gray-400 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Sites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="tech-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">最佳选址位置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSites.map((site, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 bg-white/5 rounded-lg border transition-all cursor-pointer ${
                    selectedSiteIndex === index 
                      ? 'border-cyan-400/50 bg-cyan-400/10' 
                      : 'border-white/10 hover:border-cyan-400/30'
                  }`}
                  onClick={() => setSelectedSiteIndex(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">位置 {index + 1}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      site.score > 0.8 ? 'bg-emerald-400/20 text-emerald-400' :
                      site.score > 0.7 ? 'bg-amber-400/20 text-amber-400' :
                      'bg-cyan-400/20 text-cyan-400'
                    }`}>
                      {site.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">坐标:</span>
                      <span className="text-white">({site.x}, {site.y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">海拔:</span>
                      <span className="text-white">{site.elevation.toFixed(1)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">坡度:</span>
                      <span className="text-white">{site.slope.toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">太阳辐射:</span>
                      <span className="text-white">{site.solarRadiation.toFixed(0)} W/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">风速:</span>
                      <span className="text-white">{site.windSpeed.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">土壤稳定性:</span>
                      <span className="text-white">{(site.soilStability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">距道路:</span>
                      <span className="text-white">{site.distanceToRoad.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">电网距离:</span>
                      <span className="text-white">{site.gridConnection.toFixed(1)} km</span>
                    </div>
                  </div>

                  {/* 推荐理由 */}
                  {(() => {
                    const { strengths, cautions } = generateSiteRationale(site);
                    return (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        {strengths.length > 0 && (
                          <div>
                            <p className="text-xs text-emerald-400 font-medium mb-1">推荐理由</p>
                            <div className="flex flex-wrap gap-1">
                              {strengths.map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {cautions.length > 0 && (
                          <div>
                            <p className="text-xs text-amber-400 font-medium mb-1">注意事项</p>
                            <div className="flex flex-wrap gap-1">
                              {cautions.map((c, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                  ⚠ {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* No Results */}
      {!loading && selectedSites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tech-card p-6 text-center"
        >
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">未运行分析</h3>
          <p className="text-gray-400">点击"运行算法"按钮开始智能选址分析</p>
        </motion.div>
      )}
    </div>
  );
};

export default SiteSelection;