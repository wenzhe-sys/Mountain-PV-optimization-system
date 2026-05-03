# 山地光伏电站设计优化系统

<div align="center">

![Mountain PV System](https://img.shields.io/badge/山地光伏-设计优化系统-blue)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![React](https://img.shields.io/badge/React-19.0-cyan)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-orange)

**基于多目标优化算法的山地光伏电站全流程智能设计系统**

</div>

---

## 📋 项目简介

山地光伏电站设计优化系统是一个综合性的智能设计平台，旨在解决山地复杂地形条件下光伏电站的设计优化问题。系统采用模块化设计，集成了地形分析、智能选址、分区优化、设备选型、电缆路由规划等多个功能模块。

### 核心特性

- 🏔️ **复杂地形分析** - 支持山地、丘陵、平原等多种地形的坡度、坡向、太阳辐射分析
- 🎯 **智能分区优化** - 基于深度强化学习(DQN)和Benders分解的混合算法
- ⚡ **电气设备选址** - 箱变和逆变器的最优位置规划
- 🔌 **电缆路由规划** - 共沟敷设的电缆路径优化，降低成本
- 📊 **多目标优化** - 同时考虑成本、效率、可靠性等多重目标
- 📈 **结果可视化** - 帕累托前沿、分区图、收敛曲线等丰富图表

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端展示层 (React + Vite)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │仪表盘   │ │地形可视化│ │优化演示 │ │成本分析 │ │运维监控 │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       后端API层 (FastAPI)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │健康检查 │ │优化接口 │ │算例管理 │ │结果查询 │ │WebSocket│  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      优化算法层 (Python)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   模块一    │  │   模块二    │  │   模块三    │            │
│  │ 光伏面板   │  │ 电气设备   │  │ 全局优化   │            │
│  │ 切割分区   │  │ 选址电缆   │  │ 成本分析   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                  │                     │
│         └────────────────┴──────────────────┘                     │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │   DQN + Benders混合   │                          │
│              │       优化引擎         │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
Mountain-PV-system/
├── app/                          # 前端应用 (React + TypeScript)
│   ├── src/
│   │   ├── components/           # React 组件
│   │   │   ├── ui/             # UI基础组件库
│   │   │   ├── DashboardComponents.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── sections/           # 页面模块
│   │   │   ├── Dashboard.tsx         # 系统概览仪表盘
│   │   │   ├── TerrainView.tsx       # 山地地形可视化
│   │   │   ├── OptimizationDemo.tsx  # 优化演示
│   │   │   ├── PanelLayout.tsx       # 光伏面板布局
│   │   │   ├── EquipmentView.tsx      # 电气设备选址
│   │   │   ├── CableRouting.tsx       # 电缆路由规划
│   │   │   ├── CostAnalysis.tsx       # 成本效益分析
│   │   │   ├── PowerAnalysis.tsx      # 电力损耗分析
│   │   │   ├── EcoImpact.tsx          # 生态影响评估
│   │   │   ├── Monitoring.tsx         # 运维监控中心
│   │   │   ├── AlgorithmPerformance.tsx # 算法性能分析
│   │   │   ├── SiteSelection.tsx      # 智能选址
│   │   │   ├── InstanceManager.tsx     # 算例管理
│   │   │   └── ...
│   │   ├── services/            # API服务
│   │   │   ├── apiClient.ts
│   │   │   ├── optimizationService.ts
│   │   │   ├── instanceService.ts
│   │   │   └── ...
│   │   ├── store/               # 状态管理
│   │   └── App.tsx              # 主应用入口
│   └── package.json
│
├── backend/                      # 后端服务 (Node.js)
│   ├── src/
│   │   ├── controllers/         # 控制器
│   │   ├── models/              # 数据模型
│   │   ├── routes/              # 路由
│   │   └── utils/               # 工具函数
│   └── server.js
│
├── mountain_pv_optimization/     # 核心优化算法 (Python)
│   ├── api/
│   │   ├── server.py           # FastAPI服务器
│   │   └── visualizations/     # 可视化结果
│   ├── modules/
│   │   ├── module1/            # 模块一：光伏面板切割分区
│   │   │   └── algorithm/
│   │   │       └── benders_decomposition.py
│   │   ├── module2/            # 模块二：电气设备选址电缆路由
│   │   │   └── algorithm/
│   │   │       └── branch_and_price.py
│   │   └── module3/            # 模块三：全局优化
│   ├── model/                   # 数学模型
│   │   ├── model_cutting_partition.py
│   │   ├── model_equipment_cable.py
│   │   └── model_integration.py
│   ├── utils/                   # 工具函数
│   │   ├── database_manager.py
│   │   ├── visualization.py
│   │   └── task_queue.py
│   ├── data/
│   │   └── processed/          # 预处理后的算例数据
│   │       └── PV/public/
│   │           ├── easy/        # 简单算例 (r1-r17)
│   │           ├── medium/      # 中等算例 (r30-r77, r103-r113)
│   │           ├── hard/         # 困难算例 (r42-r53, r78-r89, r114-r125)
│   │           └── extended/     # 扩展算例 (r18-r29, r54-r65, r90-r101)
│   └── main.py                  # 优化主入口
│
├── deploy/                       # 部署配置
│   ├── frontend/Dockerfile
│   ├── backend/Dockerfile
│   └── nginx/nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0
- **Python** >= 3.9
- **npm** 或 **yarn**

### 1. 克隆项目

```bash
git clone https://github.com/wenzhe-sys/Mountain-PV-system.git
cd Mountain-PV-system
```

### 2. 安装前端依赖

```bash
cd app
npm install
```

### 3. 安装后端依赖 (Python)

```bash
cd mountain_pv_optimization
pip install -r requirements.txt
```

### 4. 启动服务

**启动前端 (端口 8080)**
```bash
cd app
npm run dev
```

**启动后端API (端口 8003)**
```bash
cd mountain_pv_optimization/api
uvicorn server:app --host 0.0.0.0 --port 8003 --reload
```

### 5. 访问应用

打开浏览器访问: http://localhost:8080

---

## 📖 功能模块

### 1. 系统概览仪表盘
展示光伏电站设计的整体KPI指标，包括：
- 总装机容量
- 年发电量
- 系统效率
- 覆盖面积利用率

### 2. 山地地形可视化
基于Three.js的3D地形展示，支持：
- 地形坡度分析
- 坡向分析
- 太阳辐射强度可视化
- 可建设区域识别

### 3. 光伏面板布局规划
- 自动分区算法
- 面板密度优化
- 分区结果3D展示

### 4. 电气设备选址
- 箱变位置优化
- 逆变器配置
- 设备成本计算

### 5. 电缆路由规划
- 共沟敷设优化
- 电缆长度最小化
- 成本优化

### 6. 成本效益分析
- 初始投资成本
- 运维成本
- LCOE计算
- 投资回收期

### 7. 优化演示
交互式优化界面，支持：
- 选择不同算例
- 调整优化参数
- 实时查看优化进度
- 结果对比分析

---

## 🔧 优化算法

### 模块一：光伏面板切割及分区

采用**Benders分解**和**深度强化学习(DQN)**混合策略：

```
┌─────────────────────────────────────────┐
│          主问题：分区数量决策            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       子问题：每个分区的面板切割          │
│       (独立求解，并行计算)               │
└─────────────────────────────────────────┘
```

### 模块二：电气设备选址与电缆路由

采用**分支定价算法**：

- 电缆路由规划
- 箱变位置优化
- 共沟敷设约束

### 模块三：全局优化与成本分析

多目标优化框架，同时优化：

- 总成本最小化
- 系统效率最大化
- 可靠性约束满足

---

## 📊 算例说明

系统内置123个标准算例，覆盖不同规模和难度：

| 难度等级 | 算例范围 | 地形特点 | 节点数量 |
|---------|----------|---------|---------|
| 简单    | r1-r17   | 平原地形 | 100-200 |
| 中等    | r30-r77, r103-r113 | 丘陵地形 | 300-500 |
| 困难    | r42-r53, r78-r89, r114-r125 | 山地地形 | 600-1000 |
| 扩展    | r18-r29, r54-r65, r90-r101 | 混合地形 | 500-800 |

---

## 🔌 API接口

### 健康检查
```
GET /api/health
```

### 运行优化
```
POST /api/optimize
{
  "instance_id": "r1",
  "use_dqn": true,
  "max_iter": 10,
  "verbose": false,
  "fast_mode": true
}
```

### 获取算例列表
```
GET /api/instances
```

### 获取优化结果
```
GET /api/results/{instance_id}
```

---

## 🐳 Docker部署

### 构建镜像

```bash
# 构建前端镜像
docker build -t mountain-pv-frontend ./deploy/frontend

# 构建后端镜像
docker build -t mountain-pv-backend ./deploy/backend
```

### 使用Docker Compose启动

```bash
docker-compose up -d
```

---

## 📝 配置说明

### 前端环境变量

```env
VITE_API_URL=http://localhost:8003
```

### 后端配置

主要配置项在 `mountain_pv_optimization/api/server.py` 中：

- API端口：8003
- CORS配置：允许所有来源
- 缓存时间：3600秒

---

## 🎯 使用流程

1. **登录系统** - 使用管理员账号登录
2. **选择算例** - 从算例列表中选择待优化的项目
3. **配置参数** - 设置迭代次数、优化策略等
4. **运行优化** - 点击开始优化，观察进度
5. **查看结果** - 优化完成后查看详细结果和可视化
6. **导出报告** - 导出优化结果用于后续分析

---

## 📈 技术栈

### 前端
- **React 19** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画效果
- **Three.js / React Three Fiber** - 3D可视化
- **Recharts** - 图表展示
- **Zustand** - 状态管理
- **React Router** - 路由管理

### 后端
- **FastAPI** - Web框架
- **Uvicorn** - ASGI服务器
- **SQLAlchemy** - ORM
- **Pydantic** - 数据验证

### 优化算法
- **PyTorch** - 深度学习框架
- **NumPy** - 数值计算
- **SciPy** - 科学计算
- **PuLP** - 线性规划
- **OR-Tools** - 运筹优化

---

## 📄 许可证

本项目仅供学术研究使用。

---

## 👥 贡献者

本项目由光伏设计优化研究团队开发维护。

---

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

<div align="center">

**让山地光伏设计更智能、更高效**

</div>
