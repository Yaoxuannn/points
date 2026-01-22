import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Hotel, 
  Landmark, 
  Plus, 
  Edit2,
  X,
  Wallet,
  TrendingUp,
  CreditCard,
  Moon,
  Sun
} from 'lucide-react';

// --- 组件：像素星空 (星星 + 月亮) ---
const PixelSky = ({ darkMode }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);

  // 初始化星星数据
  useEffect(() => {
    // 生成 50 颗随机星星
    starsRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random(), // 使用 0-1 的相对坐标
      y: Math.random() * 0.6, // 只在屏幕上半部分
      size: Math.random() > 0.8 ? 4 : 2, // 大小不一
      blinkSpeed: 0.02 + Math.random() * 0.05, // 闪烁速度
      blinkOffset: Math.random() * Math.PI * 2 // 闪烁相位
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 1;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // 1. 绘制星星
      starsRef.current.forEach(star => {
        const opacity = 0.3 + 0.7 * Math.abs(Math.sin(time * star.blinkSpeed + star.blinkOffset));
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        
        const px = Math.floor((star.x * w) / 2) * 2;
        const py = Math.floor((star.y * h) / 2) * 2;
        
        ctx.fillRect(px, py, star.size, star.size);
      });

      // 2. 绘制像素月亮
      const moonCx = w * 0.85; 
      const moonCy = h * 0.15; 
      const moonRadius = 24;
      const pixelSize = 4;

      ctx.fillStyle = "#fef3c7"; 
      
      for (let y = -moonRadius; y <= moonRadius; y += pixelSize) {
        for (let x = -moonRadius; x <= moonRadius; x += pixelSize) {
          if (x*x + y*y <= moonRadius*moonRadius) {
             if ((x === 4 && y === -4) || (x === -8 && y === 8)) {
               ctx.fillStyle = "#fde68a"; 
               ctx.fillRect(moonCx + x, moonCy + y, pixelSize, pixelSize);
               ctx.fillStyle = "#fef3c7"; 
             } else {
               ctx.fillRect(moonCx + x, moonCy + y, pixelSize, pixelSize);
             }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000 ${darkMode ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

// --- 组件：精致版 Canvas 像素海浪 (增强随机感) ---
const PixelWaves = ({ darkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const pixelSize = 6; 
    const waveLayers = 3;

    const getColors = (layerIndex) => {
      if (!darkMode) {
        const opacity = 0.5 + (layerIndex * 0.2); 
        if (layerIndex === 0) return `rgba(199, 210, 254, ${opacity})`; 
        if (layerIndex === 1) return `rgba(165, 180, 252, ${opacity})`; 
        return `rgba(129, 140, 248, ${opacity})`; 
      } else {
        const opacity = 0.4 + (layerIndex * 0.2);
        if (layerIndex === 0) return `rgba(49, 46, 129, ${opacity})`; 
        if (layerIndex === 1) return `rgba(67, 56, 202, ${opacity})`; 
        return `rgba(79, 70, 229, ${opacity})`; 
      }
    };

    const render = () => {
      time += 0.01; // 稍微减慢基准时间流速，让波动更优雅
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const w = rect.width;
      const h = rect.height;
      const columns = Math.ceil(w / pixelSize);

      for (let l = 0; l < waveLayers; l++) {
        ctx.fillStyle = getColors(l);
        ctx.beginPath();

        // 基础参数 - 每一层都有独特的“性格”
        const layerSeed = (l + 1) * 7.5; // 给每一层一个固定的偏移种子
        const speed = 0.3 + (l * 0.15); // 每一层速度递增
        
        const baseAmplitude = darkMode ? 8 : 16;
        const amplitude = baseAmplitude + (l * 6); 
        const yOffset = 25 + (l * 14); // 错开每一层的垂直位置

        for (let c = 0; c < columns; c++) {
          const x = c * pixelSize;
          
          // --- 核心算法升级：多重正弦波叠加 ---
          
          // 1. 主波浪 (Large Swell): 决定整体走势
          let y = Math.sin(x * 0.005 + time * speed + layerSeed) * amplitude;
          
          // 2. 次波浪 (Medium Chop): 频率稍快，稍微反向或错位，打破规律
          y += Math.sin(x * 0.012 - time * speed * 0.5 + layerSeed * 2) * (amplitude * 0.4);

          // 3. 微波浪 (Small Ripples): 模拟水面细节，深色模式下稍微平静一些
          const noiseFactor = darkMode ? 0.15 : 0.25;
          // 使用非整数倍率 (0.027, 1.3) 避免循环感
          y += Math.sin(x * 0.027 + time * speed * 1.3) * (amplitude * noiseFactor);

          // 4. 超长周期起伏 (Tide): 模拟大海缓慢的呼吸感
          y += Math.sin(time * 0.2 + l) * 3;

          // 像素量化
          const quantizedY = Math.floor((h - yOffset - y) / pixelSize) * pixelSize;
          ctx.rect(x, quantizedY, pixelSize, h - quantizedY);
        }
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [darkMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed bottom-0 left-0 w-full h-40 pointer-events-none z-0 opacity-90 transition-opacity duration-1000"
    />
  );
};

// --- 系统预置数据库 ---
const PRESETS = [
  // --- 航空 (Airlines) ---
  { value: 'AC', label: 'Air Canada Aeroplan', type: 'airline', code: 'AC', name: 'Aeroplan', color: 'bg-red-700', cpp: 2.0 },
  { value: 'FB', label: 'Air France/KLM Flying Blue', type: 'airline', code: 'FB', name: 'Flying Blue', color: 'bg-blue-800', cpp: 1.5 },
  { value: 'CX', label: 'Cathay Asia Miles', type: 'airline', code: 'CX', name: 'Asia Miles', color: 'bg-teal-700', cpp: 1.4 },
  { value: 'NH', label: 'ANA Mileage Club', type: 'airline', code: 'NH', name: 'ANA Mileage Club', color: 'bg-blue-600', cpp: 1.5 },
  { value: 'BA', label: 'British Airways Avios', type: 'airline', code: 'BA', name: 'British Airways', color: 'bg-blue-900', cpp: 1.3 },
  { value: 'DL', label: 'Delta SkyMiles', type: 'airline', code: 'DL', name: 'Delta SkyMiles', color: 'bg-purple-700', cpp: 1.1 },
  { value: 'UA', label: 'United MileagePlus', type: 'airline', code: 'UA', name: 'United MileagePlus', color: 'bg-blue-500', cpp: 1.2 },
  { value: 'AS', label: 'Alaska Airlines Mileage Plan', type: 'airline', code: 'AS', name: 'Alaska Mileage Plan', color: 'bg-slate-700', cpp: 1.8 },

  // --- 酒店 (Hotels) ---
  { value: 'MB', label: 'Marriott Bonvoy', type: 'hotel', code: 'MB', name: 'Marriott Bonvoy', color: 'bg-indigo-900', cpp: 0.9 },
  { value: 'WoH', label: 'World of Hyatt', type: 'hotel', code: 'WoH', name: 'World of Hyatt', color: 'bg-sky-500', cpp: 2.0 },
  { value: 'HH', label: 'Hilton Honors', type: 'hotel', code: 'HH', name: 'Hilton Honors', color: 'bg-blue-500', cpp: 0.6 },
  { value: 'IHG', label: 'IHG One Rewards', type: 'hotel', code: 'IHG', name: 'IHG One Rewards', color: 'bg-orange-600', cpp: 0.6 },

  // --- 银行/其他 (Banks/Others) ---
  { value: 'MR', label: 'Amex Membership Rewards', type: 'bank', code: 'MR', name: 'Amex Rewards', color: 'bg-slate-800', cpp: 2.2 },
  { value: 'AM', label: 'Air Miles (Reward Miles)', type: 'bank', code: 'AM', name: 'Air Miles', color: 'bg-sky-400', cpp: 10.5 },
  { value: 'RBC', label: 'RBC Avion', type: 'bank', code: 'RBC', name: 'RBC Avion', color: 'bg-blue-700', cpp: 2.0 },
  { value: 'TD', label: 'TD Rewards', type: 'bank', code: 'TD', name: 'TD Rewards', color: 'bg-green-600', cpp: 0.5 },
  { value: 'C1', label: 'Capital One Miles', type: 'bank', code: 'C1', name: 'Capital One', color: 'bg-blue-500', cpp: 1.0 },
  { value: 'BNS', label: 'Scotia Scene+', type: 'bank', code: 'SC', name: 'Scotia Scene+', color: 'bg-red-600', cpp: 1.0 },
  { value: 'BMO', label: 'BMO Rewards', type: 'bank', code: 'BMO', name: 'BMO Rewards', color: 'bg-blue-600', cpp: 0.7 },
  { value: 'CIBC', label: 'CIBC Aventura', type: 'bank', code: 'CIBC', name: 'CIBC Aventura', color: 'bg-red-800', cpp: 1.0 },
];

const COLORS = [
  'bg-blue-600', 'bg-teal-700', 'bg-indigo-900', 'bg-sky-500', 
  'bg-red-700', 'bg-orange-500', 'bg-purple-600', 'bg-slate-800', 'bg-green-600', 'bg-pink-600', 'bg-gray-600'
];

export default function PointsTracker() {
  // --- 核心修改：从 localStorage 读取初始状态 ---
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('points_tracker_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // --- 核心修改：从 localStorage 读取深色模式偏好 ---
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('points_tracker_theme');
      return saved === 'dark'; // 如果存的是 'dark' 则为 true
    } catch (e) {
      return false;
    }
  });

  // --- 核心修改：监听变化并保存到 localStorage ---
  useEffect(() => {
    localStorage.setItem('points_tracker_data', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('points_tracker_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 表单状态
  const [formData, setFormData] = useState({
    presetId: '', // 用于追踪选择了哪个预置
    type: 'airline',
    programName: '',
    programCode: '',
    balance: '',
    cpp: '',
    color: 'bg-blue-600', // Default color
    isCustom: false // 标记是否为自定义项目
  });

  // 处理预置选择
  const handlePresetChange = (e) => {
    const val = e.target.value;
    
    if (val === 'custom') {
      // 切换到自定义模式
      setFormData(prev => ({
        ...prev,
        presetId: 'custom',
        programName: '',
        programCode: '',
        color: 'bg-blue-600',
        isCustom: true
      }));
    } else {
      // 选择了预置项目
      const selected = PRESETS.find(p => p.value === val);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          presetId: selected.value,
          type: selected.type,
          programName: selected.name,
          programCode: selected.code,
          color: selected.color,
          cpp: selected.cpp.toString(),
          isCustom: false
        }));
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        presetId: item.presetId || 'custom',
        isCustom: !item.presetId || item.presetId === 'custom'
      });
    } else {
      setEditingItem(null);
      // 默认选中第一个预置 (Aeroplan)
      const defaultPreset = PRESETS[0];
      setFormData({
        presetId: defaultPreset.value,
        type: defaultPreset.type,
        programName: defaultPreset.name,
        programCode: defaultPreset.code,
        balance: '',
        cpp: defaultPreset.cpp.toString(),
        color: defaultPreset.color,
        isCustom: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now(),
      balance: parseInt(formData.balance) || 0,
      cpp: parseFloat(formData.cpp) || 0,
      presetId: formData.isCustom ? 'custom' : formData.presetId // 确保保存 presetId
    };

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个账户吗？')) {
      setItems(items.filter(i => i.id !== id));
      setIsModalOpen(false); 
    }
  };

  const totalPoints = items.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalValue = items.reduce((acc, curr) => acc + ((curr.balance || 0) * (curr.cpp || 0) / 100), 0);

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  // 动态样式辅助
  const theme = {
    bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    cardBg: darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-white/60',
    headerText: darkMode ? 'text-white' : 'text-slate-900',
    subText: darkMode ? 'text-slate-400' : 'text-slate-500',
    accentText: darkMode ? 'text-emerald-400' : 'text-emerald-600',
    buttonActive: darkMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 shadow-sm',
    buttonInactive: darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50',
    inputBg: darkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500',
    modalBg: darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white/95 border-white/20 text-slate-900',
    iconBg: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/50 border-white/50'
  };

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 pb-32 relative overflow-hidden transition-colors duration-1000 ${theme.bg}`}>
      
      {/* --- 背景装饰 (Background Decoration) - 适配深色 --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* 左上角 */}
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob transition-colors duration-1000 ${darkMode ? 'bg-indigo-900/40 opacity-40' : 'bg-indigo-100 opacity-70'}`}></div>
        {/* 右上角 */}
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 transition-colors duration-1000 ${darkMode ? 'bg-blue-900/40 opacity-40' : 'bg-purple-100 opacity-70'}`}></div>
        {/* 左下角 */}
        <div className={`absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 transition-colors duration-1000 ${darkMode ? 'bg-purple-900/40 opacity-40' : 'bg-pink-100 opacity-70'}`}></div>
        {/* 噪点纹理 */}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${darkMode ? 'opacity-5' : 'opacity-20'}`}></div>
      </div>

      {/* 像素星空 (只在深色模式显示) */}
      <PixelSky darkMode={darkMode} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="flex-1">
            <h1 className={`text-2xl font-bold flex items-center mb-2 ${theme.headerText}`}>
              <div className={`p-2 backdrop-blur-sm rounded-xl mr-3 shadow-sm border ${theme.iconBg}`}>
                <Wallet className="text-indigo-500" /> 
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-600">
                我的积分墙
              </span>
            </h1>
            <div className="flex gap-6 text-sm">
               <div>
                 <p className={`${theme.subText} mb-0.5 font-medium`}>积分总额</p>
                 <p className={`text-2xl font-bold tracking-tight tabular-nums font-sans ${theme.headerText}`}>{totalPoints.toLocaleString()}</p>
               </div>
               <div className={`border-l pl-6 ${darkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                 <p className={`${theme.subText} mb-0.5 flex items-center font-medium`}>
                   估值 (CAD) <TrendingUp size={14} className={`ml-1 ${theme.accentText}`}/>
                 </p>
                 <p className={`text-2xl font-bold tracking-tight tabular-nums ${theme.accentText}`}>
                   $ {totalValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:self-end">
             {/* 筛选器 */}
             <div className={`backdrop-blur-md p-1 rounded-xl border flex text-sm shadow-sm ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/70 border-white/50'}`}>
              {['all', 'airline', 'hotel', 'bank'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 capitalize ${filter === f ? theme.buttonActive : theme.buttonInactive}`}
                >
                  {f === 'all' ? '全部' : f === 'airline' ? '航空' : f === 'hotel' ? '酒店' : '银行'}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {/* 深色模式切换按钮 */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:text-yellow-300' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500'}`}
                title={darkMode ? "切换亮色模式" : "切换深色模式"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => openModal()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center border border-indigo-400"
                title="添加新账户"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
             const itemValue = (item.balance * item.cpp) / 100;
             const isBank = item.type === 'bank';
             
             return (
              <div 
                key={item.id} 
                onClick={() => openModal(item)}
                className={`group backdrop-blur-sm rounded-2xl border p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[150px] ${theme.cardBg} ${darkMode ? 'hover:bg-slate-800 hover:shadow-indigo-900/20 hover:border-indigo-500/30' : 'hover:shadow-indigo-100/50 hover:-translate-y-1'}`}
              >
                {/* 顶部颜色条 */}
                <div className={`absolute top-2 left-2 bottom-2 w-1.5 rounded-full ${item.color} opacity-80`}></div>

                {/* 卡片头部 */}
                <div className="flex justify-between items-start pl-4">
                  <div className="flex items-center space-x-3">
                    {/* 文字 Code 区域 */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${darkMode ? 'shadow-none' : 'shadow-slate-200'} ${item.color}`}>
                      {item.programCode}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm leading-tight ${theme.headerText}`}>{item.programName}</h3>
                      <div className={`flex items-center text-xs font-medium mt-1.5 w-fit px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100/80 text-slate-400'}`}>
                        {item.type === 'airline' && <Plane size={10} className="mr-1.5" />}
                        {item.type === 'hotel' && <Hotel size={10} className="mr-1.5" />}
                        {item.type === 'bank' && <Landmark size={10} className="mr-1.5" />}
                        <span className="capitalize">
                          {item.type === 'airline' ? '航空' : item.type === 'hotel' ? '酒店' : '银行'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hover:text-indigo-500 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    <Edit2 size={18} />
                  </div>
                </div>

                {/* 数据区 */}
                <div className={`pl-4 pt-4 mt-2 border-t flex justify-between items-end ${darkMode ? 'border-slate-800' : 'border-slate-100/50'}`}>
                  <div>
                    <div className={`text-2xl font-bold tracking-tight leading-none tabular-nums font-sans ${theme.headerText}`}>
                      {item.balance.toLocaleString()}
                    </div>
                    <div className={`text-xs mt-1.5 font-medium ml-0.5 tabular-nums ${theme.subText}`}>
                      @{item.cpp} cpp
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold px-2.5 py-1.5 rounded-lg border tabular-nums ${
                      isBank 
                        ? (darkMode ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 'bg-amber-50 text-amber-700 border-amber-100') 
                        : (darkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border-emerald-100')
                    }`}>
                      $ {itemValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button 
            onClick={() => openModal()}
            className={`group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 min-h-[150px] ${darkMode ? 'border-slate-800 bg-slate-900/30 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-800' : 'border-slate-300/60 bg-white/30 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50'}`}
          >
            <div className={`p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Plus size={24} className="text-indigo-500" />
            </div>
            <span className="text-sm font-semibold">添加账户</span>
          </button>
        </div>
      </div>

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border ${theme.modalBg}`}>
            <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-white/50'}`}>
              <h3 className={`font-bold text-lg ${theme.headerText}`}>
                {editingItem ? '编辑账户' : '新账户'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              
              {/* 核心：选择预置项目下拉菜单 */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>选择积分项目</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.presetId}
                    onChange={handlePresetChange}
                    className={`w-full pl-4 pr-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer transition-colors border ${theme.inputBg}`}
                  >
                    <optgroup label="航空里程" className="text-slate-900">
                      {PRESETS.filter(p => p.type === 'airline').map(p => (
                        <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="酒店积分" className="text-slate-900">
                      {PRESETS.filter(p => p.type === 'hotel').map(p => (
                        <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="银行积分" className="text-slate-900">
                      {PRESETS.filter(p => p.type === 'bank').map(p => (
                        <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="其他" className="text-slate-900">
                      <option value="custom" className="text-slate-900">+ 手动添加自定义项目...</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-indigo-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* 仅在自定义模式下显示名称和代码编辑 */}
              {formData.isCustom && (
                <div className={`space-y-4 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                   <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>项目名称</label>
                    <input 
                      required
                      type="text" 
                      value={formData.programName}
                      onChange={e => setFormData({...formData, programName: e.target.value})}
                      placeholder="e.g. Flying Blue"
                      className={`w-full px-4 py-2 rounded-lg text-sm focus:ring-2 outline-none transition-all ${theme.inputBg}`}
                    />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>简码 (3-4字)</label>
                        <input 
                          required
                          maxLength={4}
                          type="text" 
                          value={formData.programCode}
                          onChange={e => setFormData({...formData, programCode: e.target.value.toUpperCase()})}
                          placeholder="FB"
                          className={`w-full px-4 py-2 rounded-lg text-sm font-bold uppercase focus:ring-2 outline-none transition-all ${theme.inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>颜色</label>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.slice(0,5).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setFormData({...formData, color: c})}
                              className={`w-6 h-6 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'} transition-all shadow-sm`}
                            />
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* 锁定模式下的信息展示 (只读) */}
              {!formData.isCustom && (
                <div className={`flex items-center space-x-4 p-4 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${formData.color}`}>
                      {formData.programCode}
                   </div>
                   <div>
                     <p className={`font-bold ${theme.headerText}`}>{formData.programName}</p>
                     <p className={`text-xs font-medium mt-0.5 ${theme.subText}`}>预置项目</p>
                   </div>
                </div>
              )}

              {/* 余额与估值 */}
              <div className="grid grid-cols-2 gap-5 pt-1">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>当前余额</label>
                  <input 
                    required
                    type="number" 
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-bold tabular-nums shadow-sm ${theme.inputBg}`}
                  />
                </div>
                 <div>
                  <label className={`flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>
                    <span>估值 (CPP)</span>
                  </label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      step="0.1"
                      value={formData.cpp}
                      onChange={e => setFormData({...formData, cpp: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-bold tabular-nums shadow-sm ${theme.inputBg}`}
                    />
                    <div className="absolute right-4 top-3.5 text-xs text-slate-400 pointer-events-none font-bold">
                      ¢
                    </div>
                  </div>
                </div>
              </div>

              <div className={`pt-4 flex gap-3 border-t mt-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                {editingItem && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(editingItem.id)}
                    className="flex-1 px-4 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-colors"
                  >
                    删除
                  </button>
                )}
                <button 
                  type="submit"
                  className={`flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 ${!editingItem ? 'w-full' : ''}`}
                >
                  保存更改
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 底部像素海浪装饰 */}
      <PixelWaves darkMode={darkMode} />

    </div>
  );
}