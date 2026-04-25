/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, 
  Zap, 
  Wind, 
  Users, 
  Info, 
  Search, 
  History, 
  ChevronLeft,
  ChevronRight, 
  ChevronDown,
  X, 
  Trash2, 
  ArrowRight,
  Globe,
  Coins,
  AlertCircle,
  CheckCircle2,
  Quote,
  Clock,
  BookOpen,
  Mail,
  Smartphone,
  ExternalLink,
  Settings2,
  RefreshCw,
  User,
  Hash,
  FileText,
  Type,
  Ruler,
  Plus
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { getEncoding } from "js-tiktoken";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import GlobeComponent from './components/Globe';

import { TRANSLATIONS } from './translations';

// ... existing code ...

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// Constants & Multipliers
const WH_PER_TOKEN = 0.00092; 
const WATER_ML_PER_WH = 1.8; // WUE = 1.8 L/kWh = 1.8 mL/Wh
const GCO2_PER_WH = 0.4;
const HUMAN_COST_PER_1000_TOKENS = 9; // cents (approx GPT-4 average)

export default function App() {
  // Language State
  const [lang, setLang] = useState<'zh' | 'en'>('en');
  const t = (path: string, params?: Record<string, string | number>) => {
    const keys = path.split('.');
    let current: any = TRANSLATIONS[lang];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }
    if (params && typeof current === 'string') {
      Object.keys(params).forEach(key => {
        // Support both {} and {{key}} formats
        current = current.replace('{}', params[key].toString()).replace(`{{${key}}}`, params[key].toString());
      });
    }
    return current;
  };

  const currentT = TRANSLATIONS[lang];

  // Dynamic Data
  const REGION_STATS = currentT.region_stats as any;
  const NAV_ITEMS = [
    { id: 'first-stop', label: t('header.nav_tokens') },
    { id: 'calculator', label: lang === 'zh' ? '成本计算' : 'Cost' },
    { id: 'third-stop', label: t('header.nav_footprint') },
    { id: 'fifth-stop', label: t('header.nav_labor') },
    { id: 'myths', label: t('header.nav_myths') },
    { id: 'action', label: t('header.nav_action') },
    { id: 'resources', label: lang === 'zh' ? '文献库' : 'Library' },
  ];
  const TASK_LEVELS = currentT.section_1.tasks;
  const MYTHS_DATA = currentT.section_myths.items;

  // State for Calculator
  const [queryCount, setQueryCount] = useState(100);
  const [tokensPerQuery, setTokensPerQuery] = useState(300);
  const [totalTokens, setTotalTokens] = useState(30000);
  
  const calculatorResources = useMemo(() => {
    const tokens = queryCount * tokensPerQuery;
    const wh = tokens * WH_PER_TOKEN;
    const water = wh * WATER_ML_PER_WH;
    const co2 = wh * GCO2_PER_WH;
    const labor = (tokens / 1000) * HUMAN_COST_PER_1000_TOKENS;
    
    return {
      tokens,
      wh,
      water,
      co2,
      labor,
      phoneCharges: (wh / 15).toFixed(1),
      waterBottles: (water / 500).toFixed(1),
      carKm: (co2 / 120).toFixed(2)
    };
  }, [queryCount, tokensPerQuery]);
  
  // State for Global Counter (simulated)
  const calculateInitialWater = () => {
    const startDate = new Date('2025-01-01T00:00:00Z').getTime();
    const now = Date.now();
    const seconds = (now - startDate) / 1000;
    return seconds * 5000 / 1e8; //亿升, 5000L/s
  };
  const [globalWater, setGlobalWater] = useState(calculateInitialWater());
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({
    '4.1': false,
    '4.2': false,
    '4.3': false,
    '4.4': false,
  });

  const toggleSubsection = (id: string) => {
    setExpandedSubsections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // State for API Query Module
  const [apiText, setApiText] = useState("");
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'deepseek'>('gemini');
  const [apiTokenResult, setApiTokenResult] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [lastCalculatedText, setLastCalculatedText] = useState("");

  // State for LocalStorage Footprint
  const [footprint, setFootprint] = useState(() => {
    const saved = localStorage.getItem('ai_footprint');
    return saved ? JSON.parse(saved) : { visits: 0, tokens: 0, water: 0, co2: 0, cost: 0 };
  });

  // State for Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // State for Region Map
  const [selectedRegion, setSelectedRegion] = useState<string | null>('asia');

  // State for Expanded Sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [activeSection, setActiveSection] = useState('hero');

  // State for Token Demo
  const [tokenDemoText, setTokenDemoText] = useState("AI does not directly recognize characters or words.");
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  
  // State for Resource Estimator
  const [estimatorTask, setEstimatorTask] = useState('free');
  const [manualTokens, setManualTokens] = useState<number>(300);

  // Handlers
  // Token calculation for visual demo
  const calculateTokens = (text: string): string[] => {
    if (!text) return [];
    
    const trimmed = text.trim();
    const zhExample = "我爱人工智能";
    const enExampleFull = "I love artificial intelligence";
    const enExampleRecognize = "AI does not directly recognize characters or words.";
    
    // Explicitly handle user provided example: 我爱人工智能
    if (trimmed === zhExample) {
      return ["我爱", "人工智能"];
    }
    
    // Explicitly handle user provided example: I love artificial intelligence
    if (trimmed.toLowerCase() === enExampleFull.toLowerCase()) {
      return ["I ", "love ", "artificial ", "intelligence"];
    }

    // Explicitly handle user provided example: AI does not directly recognize characters or words.
    if (trimmed.toLowerCase() === enExampleRecognize.toLowerCase() || text.toLowerCase() === enExampleRecognize.toLowerCase()) {
      return ["AI", " does", " not", " directly", " recognize", " characters", " or", " words", "."];
    }

    // Improved simulation logic for other inputs:
    // This regex grabs words with their potential leading space, matching common BPE patterns.
    const tokens = text.match(/\s?[\w\u4e00-\u9fa5]+|[^\s\w\u4e00-\u9fa5]+/g) || [];
    return tokens;
  };

  const tokenChunks = useMemo(() => calculateTokens(tokenDemoText), [tokenDemoText]);

  const textStats = useMemo(() => {
    const text = tokenDemoText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const totalChars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const tokens = calculateTokens(text).length;

    return { words, totalChars, charsNoSpaces, tokens };
  }, [tokenDemoText]);

  // We keep this for backward compatibility if needed, but we'll use textStats.tokens primarily
  const estimatedTokensForText = textStats.tokens;

  const estimatorConfig = useMemo(() => {
    let tokens = manualTokens;
    if (estimatorTask === 'short') tokens = 10; // 这里原本是用 manualTokens * 1000, 保持逻辑一致性或根据新需求调整
    if (estimatorTask === 'free') tokens = 300; 
    if (estimatorTask === 'complex') tokens = 750;
    if (estimatorTask === 'image') tokens = 1000; // 这里的 tokens 指的是单次查询
    
    // 我们按照 1000 次查询来展示对比
    const totalT = tokens * 1000;
    const wh = totalT * WH_PER_TOKEN;
    const water = wh * WATER_ML_PER_WH;
    const co2 = wh * GCO2_PER_WH;
    const cost = (totalT / 1000) * HUMAN_COST_PER_1000_TOKENS;
    
    const formatValue = (val: number, type: 'wh' | 'water' | 'co2' | 'cost') => {
      if (type === 'wh') {
        if (val >= 1000) return { v: (val / 1000).toFixed(2), u: 'kWh' };
        return { v: val.toFixed(1), u: 'Wh' };
      }
      if (type === 'water') {
        if (val >= 1000) return { v: (val / 1000).toFixed(2), u: 'L' };
        return { v: Math.round(val), u: 'mL' };
      }
      if (type === 'co2') {
        if (val >= 1000) return { v: (val / 1000).toFixed(2), u: 'kg' };
        return { v: val.toFixed(1), u: 'g' };
      }
      if (type === 'cost') {
        return { v: val.toFixed(2), u: '美分' };
      }
      return { v: val, u: '' };
    };

    const dWh = formatValue(wh, 'wh');
    const dW = formatValue(water, 'water');
    const dC = formatValue(co2, 'co2');
    const dCost = formatValue(cost, 'cost');

    // Physical equivalents
    // 相当于让 LED 灯泡 (10W) 工作 X 秒
    const lightSec = Math.round((wh * 3600) / 10);
    let lightDesc = { v: lightSec.toString(), u: '秒' };
    if (lightSec >= 3600) lightDesc = { v: (lightSec / 3600).toFixed(1), u: '小时' };
    else if (lightSec >= 60) lightDesc = { v: (lightSec / 60).toFixed(1), u: '分钟' };

    return { tokens: totalT, dWh, dW, dC, dCost, lightDesc };
  }, [estimatorTask, manualTokens]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Effects
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    NAV_ITEMS.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalWater(prev => prev + 0.00005); // 每秒增加 5000 升 = 0.00005 亿升
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTotalTokens(queryCount * tokensPerQuery);
  }, [queryCount, tokensPerQuery]);

  useEffect(() => {
    // 默认一段引言文字
    console.log("Token Trace Initialized");
  }, []);

  // Handlers
  const handleRecordQuery = () => {
    const wh = totalTokens * WH_PER_TOKEN;
    const currentWater = wh * WATER_ML_PER_WH;
    const currentCO2 = wh * GCO2_PER_WH;
    const currentCost = (totalTokens / 1000) * HUMAN_COST_PER_1000_TOKENS;
    
    const newFootprint = {
      visits: footprint.visits + 1,
      tokens: footprint.tokens + totalTokens,
      water: footprint.water + currentWater,
      co2: footprint.co2 + currentCO2,
      cost: (footprint.cost || 0) + currentCost
    };
    
    setFootprint(newFootprint);
    localStorage.setItem('ai_footprint', JSON.stringify(newFootprint));
  };

  const handleClearData = () => {
    localStorage.removeItem('ai_footprint');
    setFootprint({ visits: 0, tokens: 0, water: 0, co2: 0, cost: 0 });
  };

  const checkApiTokens = async () => {
    if (!apiText.trim()) return;
    setIsApiLoading(true);
    setAiResponse("");
    setApiTokenResult(null);
    setLastCalculatedText(apiText);
    
    try {
      if (selectedModel === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey || apiKey === "undefined") {
          throw new Error("GEMINI_API_KEY is not configured.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: apiText
        });
        
        const generatedText = response.text;
        if (!generatedText) throw new Error("No response generated.");
        
        setAiResponse(generatedText);

        const usage = response.usageMetadata;
        if (usage) {
          const res = {
            total: usage.totalTokenCount,
            prompt: usage.promptTokenCount,
            candidates: usage.candidatesTokenCount
          };
          setApiTokenResult(res);
          setGlobalWater(prev => prev + (res.total * WH_PER_TOKEN * WATER_ML_PER_WH / 1000));
        } else {
          const promptTokens = Math.ceil(apiText.length / 4);
          const candidatesTokens = Math.ceil(generatedText.length / 4);
          setApiTokenResult({
            total: promptTokens + candidatesTokens,
            prompt: promptTokens,
            candidates: candidatesTokens
          });
          setGlobalWater(prev => prev + ((promptTokens + candidatesTokens) * WH_PER_TOKEN * WATER_ML_PER_WH / 1000));
        }
      } else {
        // DeepSeek-R1 Tokenization Estimation Logic
        // In this pedagogical app, we simulate the calculation of DeepSeek token counts
        // using the cl100k_base tokenizer as a realistic BPE proxy.
        await new Promise(r => setTimeout(r, 1000));
        try {
          const encoding = getEncoding("cl100k_base");
          const tokens = encoding.encode(apiText).length;
          
          setApiTokenResult({
            total: tokens,
            prompt: tokens,
            candidates: 0
          });
          
          const simulatedResponse = lang === 'zh' 
            ? `[模拟结果] 使用类似 DeepSeek-R1 的 BPE 编码规则分析，本次输入约 ${tokens} Tokens。DeepSeek-R1 的 128k 词表在处理中文及代码时通常比传统的 Gemini 或 GPT 模型有更高的压缩率（即更少的 Tokens）。`
            : `[SIMULATED] Using a DeepSeek-like BPE encoding rule, this input is approximately ${tokens} Tokens. DeepSeek-R1's 128k vocabulary typically achieves higher compression (fewer tokens) for Chinese and specialized code tasks.`;
            
          setAiResponse(simulatedResponse);
          // Apply a "MoE efficiency discount" to the global water ticker simulation
          setGlobalWater(prev => prev + (tokens * (WH_PER_TOKEN * 0.6) * WATER_ML_PER_WH / 1000));
        } catch (e) {
          const tokens = Math.ceil(apiText.length / 3);
          setApiTokenResult({ total: tokens, prompt: tokens, candidates: 0 });
          setAiResponse("Estimated tokens through character ratio approximation (1:3).");
        }
      }
    } catch (err: any) {
      console.error(err);
      setAiResponse(`Process failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsApiLoading(false);
    }
  };

  // Calculations
  const calculatedResources = useMemo(() => {
    const wh = totalTokens * WH_PER_TOKEN;
    const waterMl = wh * WATER_ML_PER_WH;
    const co2G = wh * GCO2_PER_WH;
    const cents = (totalTokens / 1000) * HUMAN_COST_PER_1000_TOKENS;
    
    return { 
      wh: wh.toFixed(3), 
      waterMl: waterMl.toFixed(2), 
      co2G: co2G.toFixed(3), 
      cents: cents.toFixed(3),
      lightSec: Math.round(wh * 3600 / 10)
    };
  }, [totalTokens]);

  // Chart Data
  const energyChartData = {
    labels: lang === 'zh' ? ['传统搜索', '轻量模型', '大型模型'] : ['Legacy Search', 'Lite Model', 'Large Model'],
    datasets: [{
      label: lang === 'zh' ? '能耗 (Wh)' : 'Energy (Wh)',
      data: [0.3, 2.5, 8.5],
      backgroundColor: ['#1A4D3E', '#8b4513', '#E26D5C'],
      borderRadius: 4
    }]
  };

  const carbonGeographyData = {
    labels: lang === 'zh' ? ['中国', '美国', '欧洲', '瑞典'] : ['China', 'USA', 'Europe', 'Sweden'],
    datasets: [{
      label: lang === 'zh' ? '碳排放强度 (gCO₂/kWh)' : 'Carbon Intensity (gCO₂/kWh)',
      data: [544, 321, 174, 50],
      backgroundColor: ['#E26D5C', '#E26D5C', '#1A4D3E', '#22c55e'],
      borderRadius: 4
    }]
  };

  const waterProjectionData = {
    labels: lang === 'zh' ? ['2024', '2026', '2027', '2030 (预测)'] : ['2024', '2026', '2027', '2030 (Proj.)'],
    datasets: [{
      label: lang === 'zh' ? '全球 AI 耗水 (亿升/年)' : 'Global AI Water (Billion L/yr)',
      data: [2390, 4500, 6000, 6640], 
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="min-h-screen selection:bg-clay/30">
      
      {/* Global Water Ticker (Floating) */}
      <div className="fixed bottom-6 left-6 z-[60] group">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-3xl border border-forest/10 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(26,77,62,0.1)] flex items-center gap-5 transition-all hover:scale-105"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
            <Droplet size={20} className="relative z-10 animate-bounce" />
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-blue-400 opacity-20" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60">Global AI Water Pulse</span>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-sans text-blue-600 tabular-nums">
                {globalWater.toFixed(5)}
              </span>
              <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{lang === 'zh' ? '亿升 / B. Liters' : 'Billion Liters'}</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-white/60 backdrop-blur-2xl border-b border-forest/5 py-4 lg:py-6 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-forest rounded-xl flex items-center justify-center">
            <Globe size={18} className="text-beige animate-pulse" />
          </div>
          <span className="font-display font-black text-xl lg:text-2xl tracking-tighter text-forest">TOKEN TRACE</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-clay active:scale-95 ${activeSection === item.id ? 'text-clay opacity-100' : 'opacity-30'}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="w-10 h-10 lg:w-12 lg:h-12 border border-forest/10 rounded-full flex items-center justify-center hover:bg-forest hover:text-beige transition-all group active:scale-90 text-forest"
          >
            <span className="text-[11px] font-black uppercase tracking-widest">{lang === 'zh' ? 'EN' : 'ZH'}</span>
          </button>
          
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-forest text-beige rounded-full flex items-center justify-center hover:bg-clay hover:text-white transition-all shadow-xl active:scale-90"
          >
            <History size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-48 pb-32 px-10 max-w-7xl mx-auto">
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-1.5 bg-clay rounded-full rotate-45" />
            <span className="text-[10px] font-black tracking-[0.4em] text-clay uppercase">
              {t('hero.label')}
            </span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black text-forest mb-12 font-display tracking-tight leading-[0.9]">
            {t('hero.title')}
          </h1>
          
          <p className="editorial-text max-w-3xl mb-0 !text-forest/60">
            {t('hero.desc')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
          {/* Query Interface (Left) */}
          <div className="bg-white border border-forest/5 rounded-[40px] shadow-[0_12px_60px_rgba(0,0,0,0.03)] p-12 h-full flex flex-col min-h-[500px]">
            <textarea 
              className="w-full flex-1 p-0 bg-transparent border-none focus:ring-0 outline-none resize-none font-serif text-3xl text-forest placeholder:text-forest/20 leading-relaxed mb-12"
              placeholder={t('hero.placeholder')}
              value={apiText}
              onChange={(e) => setApiText(e.target.value)}
            />
            
            <div className="pt-8 border-t border-forest/5 flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-forest tracking-widest uppercase opacity-40">
                    {t('hero.model_label')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedModel('gemini')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${selectedModel === 'gemini' ? 'bg-forest text-white border-forest' : 'text-forest/40 border-forest/10 hover:text-forest'}`}
                    >
                      Gemini 3 Flash
                    </button>
                    <button 
                      onClick={() => setSelectedModel('deepseek')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${selectedModel === 'deepseek' ? 'bg-forest text-white border-forest' : 'text-forest/40 border-forest/10 hover:text-forest'}`}
                    >
                      DeepSeek-R1
                    </button>
                  </div>
                </div>
                <p className="text-xs italic opacity-40 font-serif">
                  {t('hero.helper')}
                </p>
              </div>

              <button 
                onClick={checkApiTokens}
                disabled={isApiLoading}
                className="px-10 py-5 bg-forest/20 hover:bg-forest/30 text-forest rounded-full font-bold text-sm transition-all flex items-center gap-3 backdrop-blur group active:scale-95 disabled:opacity-50"
              >
                {selectedModel === 'gemini' ? t('hero.btn_send_gemini') : t('hero.btn_send_deepseek')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <AnimatePresence>
              {aiResponse && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-12 pt-12 border-t border-forest/5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-clay">
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-black uppercase tracking-widest">{t('hero.ai_response')}</span>
                    </div>
                    {selectedModel === 'deepseek' && (
                      <a 
                        href={`https://tiktokenizer.vercel.app/?model=deepseek-ai%2FDeepSeek-R1&text=${encodeURIComponent(lastCalculatedText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-forest/40 hover:text-forest flex items-center gap-1 transition-all underline underline-offset-4"
                      >
                        {t('hero.external_tokenizer')}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="p-10 bg-beige/40 rounded-3xl text-xl text-forest/80 italic leading-relaxed font-serif shadow-inner border border-forest/5">
                    {aiResponse}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Display (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 h-full">
            <div className="bg-white border border-forest/5 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(26,77,62,0.02)] transition-all hover:bg-forest hover:text-beige hover:shadow-[0_20px_80px_rgba(26,77,62,0.1)] group flex flex-col justify-between overflow-hidden relative">
               <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Globe size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-clay transition-all" />
                  <span className="text-[9px] font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 uppercase transition-all">{t('stats.tokens')}</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10 transition-transform group-hover:translate-x-1">
                  <span className="text-5xl font-black font-display tabular-nums tracking-tighter">{apiTokenResult?.total || 0}</span>
                  <span className="text-[10px] font-bold uppercase opacity-30 tracking-widest group-hover:opacity-60">tok</span>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                  <Globe size={120} />
               </div>
            </div>

            <div className="bg-white border border-forest/5 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(26,77,62,0.02)] transition-all hover:bg-clay hover:text-white hover:shadow-[0_20px_80px_rgba(226,109,92,0.2)] group flex flex-col justify-between overflow-hidden relative">
               <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Zap size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                  <span className="text-[9px] font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 uppercase transition-all">{t('stats.energy')}</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10 transition-transform group-hover:translate-x-1">
                  <span className="text-5xl font-black font-display tabular-nums tracking-tighter">{(apiTokenResult ? apiTokenResult.total * WH_PER_TOKEN : 0).toFixed(3)}</span>
                  <span className="text-[10px] font-bold uppercase opacity-30 tracking-widest group-hover:opacity-60">Wh</span>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                  <Zap size={120} />
               </div>
            </div>

            <div className="bg-white border border-forest/5 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(26,77,62,0.02)] transition-all hover:bg-blue-500 hover:text-white hover:shadow-[0_20px_80px_rgba(59,130,246,0.2)] group flex flex-col justify-between overflow-hidden relative">
               <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Droplet size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                  <span className="text-[9px] font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 uppercase transition-all">{t('stats.water')}</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10 transition-transform group-hover:translate-x-1">
                  <span className="text-5xl font-black font-display tabular-nums tracking-tighter">{(apiTokenResult ? apiTokenResult.total * WH_PER_TOKEN * WATER_ML_PER_WH : 0).toFixed(3)}</span>
                  <span className="text-[10px] font-bold uppercase opacity-30 tracking-widest group-hover:opacity-60">mL</span>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                  <Droplet size={120} />
               </div>
            </div>

            <div className="bg-white border border-forest/5 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(26,77,62,0.02)] transition-all hover:bg-forest hover:text-beige hover:shadow-[0_20px_80px_rgba(26,77,62,0.1)] group flex flex-col justify-between overflow-hidden relative">
               <div className="flex items-center gap-3 mb-8 relative z-10">
                  <Wind size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                  <span className="text-[9px] font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 uppercase transition-all">{t('stats.carbon')}</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10 transition-transform group-hover:translate-x-1">
                  <span className="text-5xl font-black font-display tabular-nums tracking-tighter">{(apiTokenResult ? apiTokenResult.total * WH_PER_TOKEN * GCO2_PER_WH : 0).toFixed(3)}</span>
                  <span className="text-[10px] font-bold uppercase opacity-30 tracking-widest group-hover:opacity-60">g CO₂</span>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                  <Wind size={120} />
               </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pl-6 border-l-2 border-clay/30 py-4">
          <p className="text-2xl italic font-serif text-clay/80 leading-relaxed">
            {t('hero.footer_quote')}
          </p>
        </div>
      </section>

      {/* Section 1: Tokens */}
      <section id="first-stop" className="py-40 px-6 max-w-7xl mx-auto border-t border-forest/5">
        <div className="mb-24">
          <h2 className="theme-label">{lang === 'zh' ? '第一站 / STATION 01 — TOKENS' : 'STATION 01 — TOKENS'}</h2>
          <h3 className="section-title !mb-6">{t('section_1.title')}</h3>
          <p className="editorial-text max-w-3xl opacity-60">
            {t('section_1.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
          {/* Left: Interactive Input */}
          <div className="space-y-12 py-4">
            <div className="space-y-8">
              <span className="text-[11px] font-black text-clay uppercase tracking-[0.3em] block">
                {t('section_1.demo_label')}
              </span>
              <h4 className="text-4xl md:text-5xl font-black font-display text-forest leading-tight">
                {t('section_1.demo_prompt')}
              </h4>
              
              <div className="space-y-6 pt-4">
                <label className="text-[10px] font-bold uppercase opacity-30 tracking-widest block">
                  {t('section_1.your_sentence')}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={tokenDemoText}
                    onChange={(e) => setTokenDemoText(e.target.value)}
                    placeholder="Type here..."
                    className="w-full bg-transparent border-b-2 border-forest/10 py-6 text-2xl md:text-3xl focus:outline-none focus:border-clay transition-all font-serif italic text-forest/90"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-clay w-0 group-focus-within:w-full transition-all duration-700" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-forest/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                <Hash className="text-blue-500/50 mb-3 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-3xl font-black font-sans text-forest mb-1 tabular-nums">{textStats.tokens}</span>
                <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{t('section_1.tokens_stat')}</span>
              </div>
              <div className="bg-white border border-forest/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                <FileText className="text-green-600/50 mb-3 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-3xl font-black font-sans text-forest mb-1 tabular-nums">{textStats.words}</span>
                <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{t('section_1.words_stat')}</span>
              </div>
              <div className="bg-white border border-forest/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                <Type className="text-purple-600/50 mb-3 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-3xl font-black font-sans text-forest mb-1 tabular-nums">{textStats.charsNoSpaces}</span>
                <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{t('section_1.chars_no_spaces_stat')}</span>
              </div>
              <div className="bg-white border border-forest/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                <Ruler className="text-red-500/50 mb-3 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-3xl font-black font-sans text-forest mb-1 tabular-nums">{textStats.totalChars}</span>
                <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{t('section_1.total_chars_stat')}</span>
              </div>
            </div>

            <p className="text-sm opacity-40 font-medium leading-relaxed italic border-l-2 border-clay/20 pl-4 py-2">
              {t('section_1.bpe_desc')}
            </p>
          </div>

          {/* Right: Visual Split Box */}
          <div className="relative">
            <div className={`absolute inset-0 bg-white rounded-[48px] border border-forest/10 shadow-[0_20px_50px_rgba(26,77,62,0.03)] p-12 overflow-y-auto ${tokenDemoText ? '' : 'flex items-center justify-center'}`}>
              {tokenDemoText ? (
                <div className="flex flex-wrap gap-3 content-start">
                  <AnimatePresence mode="popLayout">
                    {tokenChunks.map((token, idx) => (
                      <motion.span
                        key={`${token}-${idx}`}
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                        className={`px-4 py-2 rounded-xl text-lg font-medium transition-all hover:scale-105 select-none ${
                          [
                            'bg-forest/10 text-forest border border-forest/10',
                            'bg-clay/10 text-clay border border-clay/10',
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          ][idx % 3]
                        }`}
                      >
                        {token === " " ? "␣" : token}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-forest/20" size={24} />
                  </div>
                  <p className="italic opacity-20 text-2xl font-serif">Waiting for input...</p>
                </div>
              )}
            </div>
            
            {/* Decorative pattern behind */}
            <div className="absolute -z-10 -right-6 -bottom-6 w-full h-full border border-clay/10 rounded-[48px] opacity-30" />
            <div className="absolute -z-10 -left-6 -top-6 w-full h-full border border-forest/5 rounded-[48px] opacity-20" />
          </div>
        </div>

        {/* Task Table */}
        <div className="mt-40">
          <div className="flex items-center gap-6 mb-16">
            <h4 className="text-3xl md:text-5xl font-black font-display text-forest tracking-tighter leading-none whitespace-nowrap">{t('section_1.table_title')}</h4>
            <div className="h-px bg-forest/10 flex-1" />
          </div>
          <div className="bg-white rounded-[48px] border border-forest/5 overflow-hidden shadow-[0_32px_80px_rgba(26,77,62,0.03)] group/table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest/5 bg-forest/[0.01]">
                  <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-forest/30">{t('section_1.table_col_task')}</th>
                  <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-forest/30">{t('section_1.table_col_tokens')}</th>
                  <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-forest/30">{t('section_1.table_col_driver')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {TASK_LEVELS.map((row: any, idx: number) => (
                  <tr key={idx} className="group/row hover:bg-forest/[0.01] transition-all">
                    <td className="px-12 py-12">
                      <span className="text-xl font-black text-forest group-hover/row:text-clay transition-colors block leading-tight">{row.name}</span>
                    </td>
                    <td className="px-12 py-12">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">≈</span>
                        <span className="text-3xl font-black font-sans text-forest/90 tabular-nums">{row.tokens.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-12 py-12">
                      <p className="text-base italic opacity-40 font-serif max-w-sm leading-relaxed group-hover/row:opacity-60 transition-opacity">{row.driver}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* External Precision Tools */}
        <div className="mt-40 max-w-5xl mx-auto px-6">
          <div className="bg-white border border-forest/5 p-12 md:p-16 rounded-[48px] shadow-[0_20px_50px_rgba(26,77,62,0.02)] flex flex-col md:flex-row items-center gap-10 hover:shadow-[0_40px_100px_rgba(26,77,62,0.06)] transition-all duration-700">
             <div className="w-20 h-20 bg-forest/5 rounded-3xl flex items-center justify-center shrink-0">
                <ExternalLink size={32} className="text-forest/30" />
             </div>
             <div className="flex-1 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest text-forest/40 mb-3">{t('section_1.external_tools_title')}</h4>
                <p className="text-lg font-medium opacity-60 m-0 leading-relaxed max-w-xl">{t('section_1.external_tools_desc')}</p>
             </div>
             <a 
               href="https://tokencalculator.com/home" 
               target="_blank" 
               rel="noreferrer"
               className="px-10 py-5 bg-forest text-beige rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-clay hover:text-white transition-all flex items-center gap-4 shadow-xl active:scale-95 group/calc"
             >
               {t('section_1.external_tools_btn')}
               <ExternalLink size={14} className="group-hover/calc:translate-x-0.5 group-hover/calc:-translate-y-0.5 transition-transform" />
             </a>
          </div>
        </div>
      </section>

      {/* Resource Cost Calculator Section */}
      <section id="calculator" className="py-60 bg-sand/40 border-y border-forest/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.015] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="calculator-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#calculator-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Logic Introduction Header */}
          <div className="max-w-5xl mb-40">
            <div className="flex flex-col gap-12">
               <div className="space-y-8">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-clay/10 rounded-2xl flex items-center justify-center text-clay">
                     <Info size={24} />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-[0.4em] text-clay">
                     {t('section_1.logic_title')}
                   </span>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-6 top-0 bottom-0 w-2 bg-clay/20 rounded-full" />
                   <p className="text-4xl md:text-6xl font-black font-display text-forest leading-[0.95] tracking-tight pl-6">
                     {t('section_1.logic_core')}
                   </p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start py-12">
                 <div className="space-y-10 border-t border-forest/5 pt-12">
                   <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-forest/30">
                     {t('section_1.logic_evidence_title')}
                   </h5>
                   <ul className="space-y-8">
                     {Array.isArray(t('section_1.logic_evidence_items')) && (t('section_1.logic_evidence_items') as any[]).map((item, i) => (
                       <li key={i} className="text-lg font-medium leading-relaxed text-forest/70 group flex gap-6">
                         <div className="w-2 h-2 rounded-full bg-clay mt-3 group-hover:scale-150 transition-transform shrink-0" />
                         <div>
                           {typeof item === 'string' ? item : (
                             <>
                               <span className="font-black text-forest">{(item as any).title}:</span>{" "}
                               {(item as any).desc}
                             </>
                           )}
                         </div>
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div className="space-y-12 border-t border-forest/5 pt-12">
                   <div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-forest/30 mb-8">
                        {t('section_1.logic_metric')}
                      </h5>
                      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[32px] border border-forest/5 shadow-sm transform hover:-rotate-1 transition-transform">
                        <div className="text-5xl font-black font-display text-forest tracking-tighter">
                          {lang === 'zh' ? 'J / tok' : 'Energy per Token'}
                        </div>
                        <p className="text-sm font-medium opacity-40 mt-4 italic">The fundamental unit of AI environmental impact accounting.</p>
                      </div>
                   </div>

                   <div className="bg-forest text-beige p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                      <div className="flex items-start gap-6 relative z-10">
                        <Wind className="text-clay/50 shrink-0" size={32} />
                        <p className="text-xl font-bold leading-snug m-0 group-hover:translate-x-1 transition-transform">
                          {t('section_1.logic_final')}
                        </p>
                      </div>
                      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Wind size={200} />
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Interactive Calculator Body */}
          <div className="flex flex-col lg:flex-row gap-24 items-stretch">
            <div className="lg:w-5/12 space-y-12">
              <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                  <h3 className="section-title !mb-0 font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                    {t('section_calculator.title')}
                  </h3>
                </div>
                <p className="text-xl md:text-2xl font-sans font-medium opacity-50 leading-relaxed tracking-normal max-w-md">
                   {t('section_calculator.subtitle')}
                </p>
              </div>
              
              <div className="space-y-10 pt-4 flex-1">
                {/* Sliders */}
                <div className="space-y-6 p-8 bg-white/40 backdrop-blur-sm rounded-[32px] border border-forest/5">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('section_calculator.queries_label')}</label>
                        <span className="text-3xl font-black font-sans text-forest tabular-nums">{queryCount.toLocaleString()} <span className="text-sm opacity-20 ml-1">×</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10000" 
                        step="1"
                        value={queryCount}
                        onChange={(e) => setQueryCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-forest/10 rounded-full appearance-none cursor-pointer accent-clay"
                      />
                      <div className="flex justify-between text-[9px] font-bold opacity-20 uppercase tracking-widest">
                        <span>1</span>
                        <span>10,000</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('section_calculator.tokens_per_reply_label')}</label>
                        <span className="text-3xl font-black font-sans text-forest tabular-nums">{tokensPerQuery.toLocaleString()} <span className="text-xs opacity-20 ml-1 uppercase tracking-wider font-bold">tok</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="2000" 
                        step="10"
                        value={tokensPerQuery}
                        onChange={(e) => setTokensPerQuery(Number(e.target.value))}
                        className="w-full h-1.5 bg-forest/10 rounded-full appearance-none cursor-pointer accent-clay"
                      />
                      <div className="flex justify-between text-[9px] font-bold opacity-20 uppercase tracking-widest">
                        <span>10</span>
                        <span>2,000</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleRecordQuery}
                    className="w-full py-6 mt-4 bg-forest text-beige rounded-2xl font-black text-sm hover:bg-forest/90 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                  >
                    <Plus className="group-hover:rotate-180 transition-transform duration-500" size={18} />
                    {t('section_calculator.btn_add_footprint')}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Cards */}
              <div className="bg-white border border-forest/5 rounded-[40px] p-10 shadow-[0_4px_24px_rgba(26,77,62,0.02)] relative overflow-hidden group hover:shadow-[0_24px_80px_rgba(26,77,62,0.08)] transition-all duration-700 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-forest/5 rounded-2xl flex items-center justify-center text-forest/20 mb-12 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase opacity-30 tracking-[0.2em] block text-clay">
                      {t('section_calculator.electricity_label')}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black font-sans text-forest tabular-nums tracking-tighter">
                        {calculatorResources.wh >= 1000 ? (calculatorResources.wh / 1000).toFixed(2) : calculatorResources.wh.toFixed(2)}
                      </span>
                      <span className="text-base font-bold opacity-20">{calculatorResources.wh >= 1000 ? 'kWh' : 'Wh'}</span>
                    </div>
                    <p className="text-sm opacity-40 font-medium italic pt-4">
                      {t('section_calculator.electricity_sub', { 0: calculatorResources.phoneCharges })}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 text-forest/5 scale-[3] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <Zap size={64} />
                </div>
              </div>

              <div className="bg-white border border-forest/5 rounded-[40px] p-10 shadow-[0_4px_24px_rgba(26,77,62,0.02)] relative overflow-hidden group hover:shadow-[0_24px_80px_rgba(26,77,62,0.08)] transition-all duration-700 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-500/20 mb-12 group-hover:scale-110 transition-transform">
                    <Droplet size={24} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase opacity-30 tracking-[0.2em] block text-blue-500">
                      {t('section_calculator.water_label')}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black font-sans text-forest tabular-nums tracking-tighter">
                        {calculatorResources.water >= 1000 ? (calculatorResources.water / 1000).toFixed(2) : calculatorResources.water.toFixed(1)}
                      </span>
                      <span className="text-base font-bold opacity-20">{calculatorResources.water >= 1000 ? 'L' : 'mL'}</span>
                    </div>
                    <p className="text-sm opacity-40 font-medium italic pt-4">
                      {t('section_calculator.water_sub', { 0: calculatorResources.waterBottles })}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 text-blue-500/5 scale-[3] pointer-events-none group-hover:-rotate-12 transition-transform duration-1000">
                  <Droplet size={64} />
                </div>
              </div>

              <div className="bg-white border border-forest/5 rounded-[40px] p-10 shadow-[0_4px_24px_rgba(26,77,62,0.02)] relative overflow-hidden group hover:shadow-[0_24px_80px_rgba(26,77,62,0.08)] transition-all duration-700 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-50/50 rounded-2xl flex items-center justify-center text-emerald-600/20 mb-12 group-hover:scale-110 transition-transform">
                    <Wind size={24} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase opacity-30 tracking-[0.2em] block text-emerald-600">
                      {t('section_calculator.carbon_label')}
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black font-sans text-forest tabular-nums tracking-tighter text-emerald-950">
                        {calculatorResources.co2 >= 1000 ? (calculatorResources.co2 / 1000).toFixed(2) : calculatorResources.co2.toFixed(2)}
                      </span>
                      <span className="text-base font-bold opacity-20">{calculatorResources.co2 >= 1000 ? 'kg' : 'g'} CO₂</span>
                    </div>
                    <p className="text-sm opacity-40 font-medium italic pt-4">
                      {t('section_calculator.carbon_sub', { 0: calculatorResources.carKm })}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 text-emerald-600/5 scale-[3] pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
                  <Wind size={64} />
                </div>
              </div>

              <div className="bg-white border border-forest/5 rounded-[40px] p-10 shadow-[0_4px_24px_rgba(26,77,62,0.02)] relative overflow-hidden group hover:shadow-[0_24px_80px_rgba(26,77,62,0.08)] transition-all duration-700 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-yellow-50/50 rounded-2xl flex items-center justify-center text-yellow-600/20 mb-12 group-hover:scale-110 transition-transform">
                    <Coins size={24} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase opacity-30 tracking-[0.2em] block text-yellow-600">
                      {t('section_calculator.human_labor_label')}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black font-sans text-forest tabular-nums tracking-tighter">
                        {calculatorResources.labor >= 100 ? (calculatorResources.labor / 100).toFixed(2) : Math.round(calculatorResources.labor)}
                      </span>
                      <span className="text-base font-bold opacity-20">{calculatorResources.labor >= 100 ? '$' : '¢'}</span>
                    </div>
                    <p className="text-sm opacity-40 font-medium italic pt-4 leading-relaxed">
                      {t('section_calculator.human_labor_sub')}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 text-yellow-600/5 scale-[3] pointer-events-none group-hover:-rotate-6 transition-transform duration-1000">
                  <Coins size={64} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Who Pays */}
      <section id="third-stop" className="py-40 px-6 max-w-7xl mx-auto">
        <h2 className="theme-label">{t('section_2.title')}</h2>
        <h3 className="section-title">{t('section_2.subtitle')}</h3>
        
        <div className="grid lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-forest/5 rounded-xl flex items-center justify-center text-forest">
                  <Settings2 size={20} />
                </div>
                <h4 className="text-2xl font-black font-display text-forest">{t('section_2.training_title')}</h4>
              </div>
              <p className="text-xl text-forest/70 leading-relaxed font-medium">
                {t('section_2.training_desc')}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-clay/5 rounded-xl flex items-center justify-center text-clay">
                  <Zap size={20} />
                </div>
                <h4 className="text-2xl font-black font-display text-clay">{t('section_2.inference_title')}</h4>
              </div>
              <p className="text-xl text-forest/70 leading-relaxed font-medium">
                {t('section_2.inference_desc')}
              </p>
              
              <AnimatePresence>
                {expandedSections['training'] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-8 pt-8 border-t border-forest/10 mt-8">
                       <div className="p-8 bg-forest/5 rounded-[32px] border-l-4 border-forest">
                         <p className="text-lg font-bold text-forest leading-relaxed italic">“{t('section_2.inference_audit')}”</p>
                       </div>
                       
                       <div className="grid sm:grid-cols-2 gap-8">
                         <div className="theme-card bg-sand/50 border-none group hover:bg-forest hover:text-white transition-all duration-500">
                           <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 group-hover:text-white">{t('section_2.mistral_case_title')}</h5>
                           <p className="text-sm font-bold leading-relaxed">{t('section_2.mistral_case_training')}</p>
                         </div>
                         <div className="theme-card bg-clay/5 border-none group hover:bg-clay hover:text-white transition-all duration-500">
                           <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 group-hover:text-white">{t('section_2.mistral_case_title')}</h5>
                           <p className="text-sm font-bold leading-relaxed">{t('section_2.mistral_case_inference')}</p>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                onClick={() => toggleSection('training')}
                className="expand-btn"
              >
                {expandedSections['training'] ? t('section_2.btn_collapse_energy') : t('section_2.btn_expand_energy')}
                <ChevronDown className={`transition-transform duration-500 ${expandedSections['training'] ? 'rotate-180' : ''}`} size={18} />
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-4 self-start sticky top-40">
            <div className="theme-card bg-forest text-beige border-none flex flex-col justify-center text-center p-12">
               <div className="mb-10 max-w-[240px] mx-auto w-full">
                  <Doughnut 
                    data={{
                      labels: lang === 'zh' ? ['推理', '训练'] : ['Inference', 'Training'],
                      datasets: [{
                        data: [85, 15],
                        backgroundColor: ['#E26D5C', 'rgba(255,255,255,0.1)'],
                        borderWidth: 0,
                        hoverOffset: 4
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      cutout: '75%'
                    }}
                  />
               </div>
               <div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-40 text-beige">{t('section_2.audit_report_label')}</p>
                  <p className="text-[10px] font-bold opacity-30 mb-2 uppercase tracking-widest leading-tight px-4">{t('section_2.inference_stat_label')}</p>
                  <p className="text-7xl font-black font-sans text-clay mt-2 tracking-tighter">85%</p>
                  <p className="text-[10px] italic opacity-40 mt-6 max-w-[200px] mx-auto leading-relaxed">{t('section_2.energy_audit_report')}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Infrastructure */}
      <section id="fourth-stop" className="bg-sand py-64 px-6 border-y border-forest/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-clay/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 px-6">
            <div className="text-left w-full">
              <h2 className="theme-label text-clay/60 mb-6">{t('section_2.title')} (Cont.)</h2>
              <h3 className="section-title !mb-0 text-left">{t('section_infra.title')}</h3>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-16 px-6">
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-forest/5 hover:border-clay/20 transition-all duration-700 group relative">
                <div className="w-16 h-16 bg-clay/5 rounded-3xl flex items-center justify-center text-clay mb-8 group-hover:bg-clay group-hover:text-white transition-all duration-500">
                  <Zap size={32} />
                </div>
                <h4 className="text-3xl font-black mb-6 font-display text-forest">{t('section_infra.energy_card_title')}</h4>
                <p className="text-lg leading-relaxed text-forest/70 mb-0">{t('section_infra.energy_card_desc')}</p>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-forest/5 hover:border-blue-500/20 transition-all duration-700 group">
                <div className="w-16 h-16 bg-blue-500/5 rounded-3xl flex items-center justify-center text-blue-500 mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <Droplet size={32} />
                </div>
                <h4 className="text-3xl font-black mb-6 font-display text-forest">{t('section_infra.water_card_title')}</h4>
                <p className="text-lg leading-relaxed text-forest/70 mb-0">{t('section_infra.water_card_desc')}</p>
              </div>
              
              <div className="p-10 bg-clay text-white rounded-[48px] relative overflow-hidden shadow-2xl shadow-clay/20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-4 mb-8">
                  <AlertCircle size={28} />
                  <h5 className="font-black text-xs uppercase tracking-[0.4em] font-display opacity-60">{t('section_infra.conflict_title')}</h5>
                </div>
                <p className="text-xl font-medium leading-relaxed mb-10 italic">
                  "{t('section_infra.conflict_desc')}"
                </p>
                <div className="p-6 bg-black/10 rounded-2xl border border-white/10 text-xs font-mono opacity-80">
                   {t('section_infra.conflict_quote')}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-8">
              <div className="bg-forest text-beige p-16 rounded-[64px] relative overflow-hidden flex flex-col h-full shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-clay/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 mb-16">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-clay mb-8">{t('section_infra.carbon_title')}</h4>
                   <p className="text-4xl lg:text-5xl font-black mb-10 leading-[1.1] tracking-tighter font-display">
                     {t('section_infra.carbon_desc_main')}
                   </p>
                   
                   <p className="text-xl opacity-60 leading-relaxed font-medium italic border-l-4 border-clay/30 pl-8">
                      {t('section_infra.carbon_desc_detail')}
                   </p>
                </div>

                <div className="space-y-8 relative z-10 mt-auto">
                   <div className="relative bg-white/5 rounded-[40px] border border-white/10 overflow-hidden group">
                      <div className="absolute inset-0 bg-forest/[0.02] pointer-events-none"></div>
                      <div className="p-8 pb-4 text-center">
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] opacity-40 mb-2">{t('section_infra.analyzer_title')}</h4>
                      </div>
                      
                      <div className="w-full h-[400px] relative">
                         <GlobeComponent selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />
                      </div>

                      <div className="flex flex-wrap justify-center gap-2 p-8 pt-0 relative z-10">
                         {Object.keys(REGION_STATS).map(key => (
                            <button 
                              key={key}
                              onClick={() => setSelectedRegion(key)}
                              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${selectedRegion === key ? 'bg-clay text-white border-clay shadow-[0_8px_20px_rgba(226,109,92,0.3)]' : 'border-white/10 text-beige/40 hover:border-white/30 hover:bg-white/5'}`}
                            >
                              {REGION_STATS[key].name.split(' (')[0]}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Region Data Overlay - Now moved below and styled better */}
                   <AnimatePresence mode="wait">
                      {selectedRegion && (
                        <motion.div 
                          key={selectedRegion}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="bg-white text-forest p-10 rounded-[40px] shadow-2xl border border-forest/5 relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-32 h-32 bg-clay/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                           
                           <div className="flex justify-between items-center mb-10 relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-2 h-10 bg-clay rounded-full"></div>
                                 <h5 className="font-black text-2xl uppercase tracking-tighter text-forest font-display">{REGION_STATS[selectedRegion].name}</h5>
                              </div>
                              <button 
                                onClick={() => setSelectedRegion(null)}
                                className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center hover:bg-forest/10 transition-colors"
                              >
                                <X size={18} className="opacity-40" />
                              </button>
                           </div>

                           <div className="grid md:grid-cols-2 gap-8 mb-10 relative z-10">
                              <div className="bg-sand/30 p-8 rounded-3xl border border-forest/5 group hover:bg-forest hover:text-white transition-all duration-500">
                                 <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-4 group-hover:text-beige/60">{lang === 'zh' ? '能源负载' : 'ENERGY LOAD'}</p>
                                 <p className="text-xl font-black font-display">{REGION_STATS[selectedRegion].energy}</p>
                                 {REGION_STATS[selectedRegion].water && (
                                   <p className="text-xs opacity-50 mt-4 group-hover:text-beige/40">{REGION_STATS[selectedRegion].water}</p>
                                 )}
                              </div>
                              <div className="bg-sand/30 p-8 rounded-3xl border border-forest/5 group hover:bg-clay hover:text-white transition-all duration-500">
                                 <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-4 group-hover:text-beige/60">{lang === 'zh' ? '碳排放强度' : 'CARBON INTENSITY'}</p>
                                 <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black font-sans">{REGION_STATS[selectedRegion].carbonIntensity}</p>
                                    <span className="text-xs font-bold opacity-30">g/kWh</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="p-8 bg-forest/5 rounded-3xl border border-forest/5 relative z-10">
                              <div className="flex items-center gap-3 mb-4 opacity-30">
                                 <Info size={16} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('section_infra.analyzer_insight_label')}</span>
                              </div>
                              <p className="text-sm font-medium leading-relaxed italic text-forest/70">{REGION_STATS[selectedRegion].focus}</p>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Section 4: Human-Powered AI (Chapter 4) */}
       <section id="fifth-stop" className="py-64 relative overflow-hidden bg-sand/20">
        {/* Grainy overlay */}
        <div className="absolute inset-0 bg-grainy pointer-events-none opacity-[0.03]"></div>
        
        {/* Background text decoration */}
        <div className="absolute top-20 right-0 text-[20vw] font-black text-forest/[0.02] select-none pointer-events-none font-display leading-none">
          LABOR
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mb-32"
          >
            <div className="flex flex-col gap-6 mb-12">
              <h2 className="theme-label">{t('section_human.station_label')}</h2>
              <h2 className="text-7xl md:text-[10rem] font-black font-display text-forest tracking-tighter leading-[0.85]">{t('section_human.title')}</h2>
              <div className="flex items-center gap-4">
                <span className="w-12 h-[2px] bg-clay"></span>
                <h3 className="text-lg md:text-xl font-bold text-clay tracking-tight">
                  {t('section_human.subtitle')}
                </h3>
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-serif text-forest/90 leading-relaxed font-light italic bg-white/50 backdrop-blur-sm p-4 -ml-4 border-l-4 border-clay">
              {t('section_human.intro_desc')}
            </p>
          </motion.div>
          
          <div className="space-y-64">
            {/* 4.1 Industry Chain */}
            <div className="space-y-20">
              <div className="space-y-8 text-center max-w-4xl mx-auto">
                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px bg-forest/10 w-24"></div>
                  <span className="text-[10px] font-black text-clay uppercase tracking-widest">Section 4.1</span>
                  <div className="h-px bg-forest/10 w-24"></div>
                </div>
                <h4 className="text-5xl md:text-8xl font-black font-display text-forest leading-none">
                  {t('section_human.industry_chain_title')}
                </h4>
                <p className="text-2xl md:text-3xl font-black text-clay uppercase tracking-tighter italic">
                  {t('section_human.industry_chain_subtitle')}
                </p>
              </div>

              {/* Wage Comparison Cards */}
              <div className="grid md:grid-cols-3 gap-8">
                {Array.isArray(t('section_human.wage_cards')) && (t('section_human.wage_cards') as any[]).map((card, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className={`${card.bg} p-12 rounded-[50px] border border-forest/5 flex flex-col items-center text-center space-y-6`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{card.role}</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-6xl font-black font-display">{card.label}</span>
                       <span className="text-sm font-bold opacity-30">/ HR</span>
                    </div>
                    <p className="text-sm font-bold opacity-60">{card.loc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Map List & Foldable Details */}
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="bg-white/40 backdrop-blur-md p-12 rounded-[60px] border border-forest/5 shadow-xl">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-forest/40 mb-10">{t('section_human.exploitation_map_title')}</h5>
                  <div className="flex flex-wrap gap-4">
                    {Array.isArray(t('section_human.exploitation_map_list')) && (t('section_human.exploitation_map_list') as string[]).map((loc, i) => (
                      <div key={i} className="px-6 py-3 bg-forest text-beige rounded-full text-sm font-black uppercase tracking-widest">
                        {loc}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 p-2">
                  <button 
                    onClick={() => toggleSubsection('4.1')}
                    className="w-full flex items-center justify-between p-10 bg-white border border-forest/10 rounded-[40px] text-left hover:border-clay/40 transition-all font-black uppercase text-xs tracking-widest shadow-lg group"
                  >
                    <span>{t('section_human.details_title')}</span>
                    <div className={`p-2 bg-clay rounded-full text-white transition-transform duration-500 ${expandedSubsections['4.1'] ? 'rotate-180' : ''}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSubsections['4.1'] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-10 bg-sand/10 rounded-[40px] border border-forest/5 text-lg leading-relaxed text-forest/70 font-medium">
                          {t('section_human.details_content')}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Added Wage Image */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mt-20 rounded-[60px] overflow-hidden shadow-2xl border border-forest/10 bg-white p-4"
              >
                <img 
                  src="/src/images/wage.png" 
                  alt="Global Wage Comparison" 
                  className="w-full h-auto rounded-[40px]"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* 4.2 Content Moderators */}
            <div className="space-y-20">
              <div className="space-y-8 text-center max-w-4xl mx-auto">
                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px bg-forest/10 w-24"></div>
                  <span className="text-[10px] font-black text-clay uppercase tracking-widest">Section 4.2</span>
                  <div className="h-px bg-forest/10 w-24"></div>
                </div>
                <h4 className="text-5xl md:text-8xl font-black font-display text-forest leading-none">
                  {t('section_human.moderator_title')}
                </h4>
                <p className="text-2xl md:text-3xl font-black text-clay uppercase tracking-tighter italic">
                  {t('section_human.moderator_subtitle')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Case Card */}
                <div className="bg-forest text-beige p-12 md:p-16 rounded-[80px] shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-clay opacity-10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 space-y-12">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">{t('section_human.case_card_title')}</h5>
                    <p className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                      {t('section_human.case_card_content')}
                    </p>
                  </div>
                </div>

                {/* Worker Quotes Slider */}
                <div className="space-y-10">
                  <div className="flex items-center justify-between px-6">
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-forest/40">{t('section_human.quotes_title')}</h5>
                      <p className="text-[10px] font-bold text-clay/60 italic uppercase tracking-wider">Testimonies from the digital assembly line</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-clay tracking-widest font-mono bg-clay/5 px-3 py-1 rounded-full">
                        {String(currentQuoteIdx + 1).padStart(2, '0')} / {String((t('section_human.quotes') as any[]).length).padStart(2, '0')}
                      </span>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setCurrentQuoteIdx(prev => Math.max(0, prev - 1))}
                          disabled={currentQuoteIdx === 0}
                          className="w-12 h-12 rounded-2xl border border-forest/10 flex items-center justify-center hover:bg-forest hover:text-beige disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all shadow-sm hover:shadow-md"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={() => setCurrentQuoteIdx(prev => Math.min((t('section_human.quotes') as any[]).length - 1, prev + 1))}
                          disabled={currentQuoteIdx === (t('section_human.quotes') as any[]).length - 1}
                          className="w-12 h-12 rounded-2xl border border-forest/10 flex items-center justify-center hover:bg-forest hover:text-beige disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all shadow-sm hover:shadow-md"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    {/* Decorative Background Elements */}
                    <div className="absolute -inset-4 bg-forest/5 rounded-[60px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative overflow-hidden rounded-[48px] bg-white border border-forest/5 shadow-2xl min-h-[460px] md:min-h-[420px] flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentQuoteIdx}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                          className="p-10 md:p-20 flex flex-col h-full grow"
                        >
                          {(() => {
                            const quotes = t('section_human.quotes');
                            if (!Array.isArray(quotes) || quotes.length === 0) return null;
                            const q = quotes[currentQuoteIdx % quotes.length];
                            if (!q) return null;
                            return (
                              <>
                                <div className="space-y-10 flex-grow">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-forest/5 pb-8">
                                    <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-full bg-forest text-beige flex items-center justify-center font-black text-xl">
                                        {q.name.charAt(0)}
                                      </div>
                                      <div>
                                        <h6 className="text-[11px] font-black uppercase tracking-[0.2em] text-forest/40 mb-1">Human Worker</h6>
                                        <p className="text-2xl font-black text-forest tracking-tighter transition-all">{q.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-sand/20 px-4 py-2 rounded-2xl self-start md:self-auto border border-forest/5">
                                      <Globe size={14} className="text-clay" />
                                      <p className="text-xs font-black text-forest/70 uppercase tracking-[0.15em]">{q.country}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="relative">
                                    <Quote className="absolute -top-10 -left-6 text-clay/5 -z-10" size={160} />
                                    <blockquote className="text-2xl md:text-4xl font-medium text-forest/90 leading-[1.3] tracking-tight font-serif italic relative">
                                      {q.quote}
                                    </blockquote>
                                  </div>
                                </div>

                                <div className="mt-16 pt-8 border-t border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                  <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                      {[1,2,3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-forest border-2 border-white"></div>
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-forest/40 italic">Global Industry Audit</span>
                                  </div>
                                  <div className="flex items-center gap-3 px-5 py-2.5 bg-forest/5 rounded-full border border-forest/10">
                                    <FileText size={12} className="text-clay" />
                                    <p className="text-[10px] font-bold text-forest/60 tracking-wide uppercase">
                                      Source: <span className="text-forest/80 font-black">{q.source}</span>
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Progress Dots / Discrete Navigation */}
                  <div className="flex justify-center items-center gap-3">
                    {Array.isArray(t('section_human.quotes')) && (t('section_human.quotes') as any[]).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQuoteIdx(i)}
                        className={`group relative h-8 flex items-center justify-center transition-all duration-300 ${i === currentQuoteIdx ? 'w-12' : 'w-4'}`}
                        aria-label={`Go to quote ${i + 1}`}
                      >
                        <div className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === currentQuoteIdx ? 'w-full bg-clay ring-4 ring-clay/10' : 'w-1.5 bg-forest/15 group-hover:bg-forest/30'}`} />
                        {i === currentQuoteIdx && (
                          <motion.div 
                            layoutId="activeDot"
                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-clay rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trauma List & Details */}
              <div className="space-y-12">
                <div className="bg-sand/30 p-12 md:p-20 rounded-[100px] border border-forest/5">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.6em] text-forest/40 mb-16 text-center">{t('section_human.trauma_list_title')}</h5>
                  <div className="grid md:grid-cols-3 gap-12">
                    {Array.isArray(t('section_human.trauma_items')) && (t('section_human.trauma_items') as any[]).map((item, i) => (
                      <div key={i} className="space-y-6">
                        <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-clay shadow-xl">
                          <AlertCircle size={28} />
                        </div>
                        <h6 className="text-2xl font-black text-forest leading-tight">{item.title}</h6>
                        <p className="text-sm font-medium text-forest/60 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center flex-col items-center gap-8">
                  <button 
                    onClick={() => toggleSubsection('4.2')}
                    className="px-10 py-5 bg-forest text-beige rounded-full text-xs font-black uppercase tracking-widest hover:bg-clay transition-all shadow-2xl flex items-center gap-4"
                  >
                    <span>{t('section_human.trauma_footer')}</span>
                    <ExternalLink size={14} />
                  </button>
                  <AnimatePresence>
                    {expandedSubsections['4.2'] && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-12 bg-white rounded-[60px] border border-forest/10 shadow-3xl max-w-4xl text-center space-y-10 w-full"
                      >
                         <h5 className="text-3xl font-black font-display text-forest tracking-tighter">Karen Hao on the empire of AI</h5>
                         <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-forest/5">
                           <iframe 
                             width="100%" 
                             height="100%" 
                             src="https://www.youtube.com/embed/t9G_kXUm6mI" 
                             title="Karen Hao on the empire of AI" 
                             frameBorder="0" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                             allowFullScreen
                           ></iframe>
                         </div>
                         <button 
                           onClick={() => toggleSubsection('4.2')}
                           className="w-full py-5 bg-clay text-white rounded-full font-black uppercase tracking-widest"
                         >Close Video</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 4.3 Algorithmic Bias */}
            <div className="space-y-20">
              <div className="space-y-8 text-center max-w-4xl mx-auto">
                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px bg-forest/10 w-24"></div>
                  <span className="text-[10px] font-black text-clay uppercase tracking-widest">Section 4.3</span>
                  <div className="h-px bg-forest/10 w-24"></div>
                </div>
                <h4 className="text-5xl md:text-8xl font-black font-display text-forest leading-none">
                  {t('section_human.bias_title')}
                </h4>
                <p className="text-2xl md:text-3xl font-black text-clay uppercase tracking-tighter italic">
                  {t('section_human.bias_subtitle')}
                </p>
              </div>

              {/* Triple Cards */}
              <div className="grid md:grid-cols-3 gap-8">
                {Array.isArray(t('section_human.bias_cards')) && (t('section_human.bias_cards') as any[]).map((card, i) => (
                  <div key={i} className="p-12 bg-white rounded-[60px] border border-forest/5 shadow-2xl space-y-8 group hover:-translate-y-4 transition-transform duration-700">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-sand rounded-2xl text-forest font-black font-display text-xl">0{i+1}</div>
                    <div className="space-y-4">
                      <h6 className="text-[11px] font-black uppercase tracking-widest text-clay">{card.type}</h6>
                      <p className="text-xl font-bold text-forest/70 leading-tight">{card.case}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bias Cycle Diagram */}
              <div className="bg-forest text-beige p-16 md:p-32 rounded-[120px] shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-clay/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-24 items-center relative z-10">
                  <div className="space-y-12">
                    <h5 className="text-5xl md:text-7xl font-black font-display tracking-tighter leading-none">
                      {t('section_human.bias_cycle_title')}
                    </h5>
                    <div className="space-y-6">
                      {Array.isArray(t('section_human.bias_cycle_steps')) && (t('section_human.bias_cycle_steps') as string[]).map((step, i) => (
                        <div key={i} className="flex items-center gap-6">
                           <span className="text-clay font-black font-mono">0{i+1}</span>
                           <span className="h-px bg-beige/20 flex-1"></span>
                           <span className="text-xs font-black uppercase tracking-[0.4em] opacity-60">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative group p-4 bg-white/5 rounded-[60px] border border-white/10 backdrop-blur-xl">
                    <img 
                      src="/src/images/bias cycle.png" 
                      alt="Bias Cycle" 
                      className="w-full h-auto rounded-[50px] shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02]" 
                    />
                  </div>
                </div>
              </div>

              {/* Foldable details */}
              <div className="max-w-4xl mx-auto">
                <button 
                  onClick={() => toggleSubsection('4.3')}
                  className="w-full flex items-center justify-between p-10 bg-white border border-forest/10 rounded-[40px] text-left hover:border-clay/40 transition-all font-black uppercase text-xs tracking-widest shadow-lg group"
                >
                  <span>{t('section_human.bias_details_title')}</span>
                  <div className={`p-2 bg-forest rounded-full text-white transition-transform duration-500 ${expandedSubsections['4.3'] ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedSubsections['4.3'] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-10 bg-white rounded-b-[40px] border-x border-b border-forest/5 text-lg leading-relaxed text-forest/70 font-medium font-serif italic text-center">
                        {t('section_human.bias_details_content')}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 4.4 Data Colonialism */}
            <div className="space-y-20 pb-32">
              <div className="space-y-8 text-center max-w-4xl mx-auto">
                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px bg-forest/10 w-24"></div>
                  <span className="text-[10px] font-black text-clay uppercase tracking-widest">Section 4.4</span>
                  <div className="h-px bg-forest/10 w-24"></div>
                </div>
                <h4 className="text-5xl md:text-8xl font-black font-display text-forest leading-none">
                  {t('section_human.colonialism_title')}
                </h4>
                <p className="text-2xl md:text-3xl font-black text-clay uppercase tracking-tighter italic">
                  {t('section_human.colonialism_subtitle')}
                </p>
                
                {/* Data Colonialism Image */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="mt-12 rounded-[60px] overflow-hidden shadow-2xl border border-forest/10"
                >
                  <img 
                    src="/src/images/ai data colonism.png" 
                    alt="AI Data Colonialism" 
                    className="w-full h-auto"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white rounded-[60px] border border-forest/5 shadow-3xl overflow-hidden">
                <div className="p-10 bg-sand/20 border-b border-forest/10">
                   <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-forest/40 text-center">{t('section_human.comparison_table_title')}</h5>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-forest/5 text-[10px] font-black uppercase tracking-widest text-forest/30">
                      <th className="p-10 w-1/4">Metric</th>
                      <th className="p-10 w-1/3">Global South</th>
                      <th className="p-10 w-1/3">Global North</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {Array.isArray(t('section_human.comparison_data')) && (t('section_human.comparison_data') as any[]).map((row, i) => (
                      <tr key={i} className="border-b border-forest/5 last:border-b-0 hover:bg-sand/5 transition-colors">
                        <td className="p-10 font-black text-clay">{row.label}</td>
                        <td className="p-10 text-forest/70 leading-relaxed bg-clay/5">{row.south}</td>
                        <td className="p-10 text-forest/70 leading-relaxed">{row.north}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quote & Definition */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-forest text-beige p-16 rounded-[80px] shadow-3xl space-y-10 relative overflow-hidden"
                >
                  <Quote className="absolute top-10 right-10 opacity-5" size={120} />
                  <p className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed relative z-10">
                    “{t('section_human.kate_crawford_quote')}”
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">— Kate Crawford, Atlas of AI</p>
                </motion.div>

                <div className="p-16 bg-white rounded-[80px] border border-forest/5 shadow-2xl space-y-10">
                   <div className="space-y-4">
                     <h5 className="text-3xl md:text-4xl font-black font-display text-forest tracking-tighter">
                       {t('section_human.sustainable_ai_title')}
                     </h5>
                     <div className="w-20 h-1 bg-clay"></div>
                   </div>
                   <p className="text-xl md:text-2xl font-serif text-forest/70 leading-relaxed italic">
                     “{t('section_human.sustainable_ai_def')}”
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Myths vs Reality */}
      <section id="myths" className="bg-beige border-y border-forest/10 py-64">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="theme-label text-center">{t('section_myths.title')}</h2>
          <h3 className="section-title text-center text-clay">{t('section_myths.subtitle')}</h3>
          <p className="editorial-text text-center text-forest/60 mb-24 max-w-3xl mx-auto">
            {t('section_myths.desc')}
          </p>

          <div className="p-10 bg-white rounded-[40px] border border-forest/5 shadow-xl mb-24 text-center">
             <p className="text-lg text-forest/80 italic leading-relaxed font-serif mb-6">
                {t('section_myths.quote')}
             </p>
             <p className="text-sm opacity-60 max-w-2xl mx-auto">
                {t('section_myths.source')}
             </p>
          </div>
          
          <div className="mb-24 text-center space-y-4">
             <h4 className="text-xs font-black uppercase text-forest tracking-widest opacity-30">{t('section_myths.table_label')}</h4>
          </div>

          <div className="space-y-10">
            {MYTHS_DATA.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-12 md:p-14 rounded-[40px] border border-forest/5 shadow-[0_4px_24px_rgba(26,77,62,0.02)] group hover:border-clay/30 transition-all duration-700 hover:shadow-[0_24px_80px_rgba(26,77,62,0.08)]">
                <div className="flex flex-col md:flex-row gap-8 md:items-center">
                   <div className="md:w-5/12 opacity-30 line-through decoration-forest/40 text-lg font-light italic font-serif leading-relaxed">“{item.m}”</div>
                   <div className="md:w-px h-px md:h-12 bg-forest/5" />
                   <div className="md:w-7/12 text-forest flex gap-6 text-xl md:text-2xl leading-tight font-display font-black tracking-tight">
                      <div className="w-10 h-10 bg-clay/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="text-clay" size={20} />
                      </div>
                      {item.r}
                   </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Section 7: Action & Policy */}
      <section id="action" className="py-64 px-6 max-w-7xl mx-auto">
        <h2 className="theme-label">{t('section_action.title')}</h2>
        <h3 className="section-title">{t('section_action.subtitle')}</h3>

        <div className="grid lg:grid-cols-2 gap-24 mt-28">
          {/* Action List */}
          <div className="col-span-1 space-y-16">
            <h3 className="text-3xl font-black font-display flex items-center gap-4">{lang === 'zh' ? '行动清单 / STEPS' : 'STEPS TO TAKE'}</h3>
            <ul className="space-y-12">
              {Array.isArray(t('section_action.actions')) && (t('section_action.actions') as string[]).map((text: string, idx: number) => (
                <li key={idx} className="flex gap-8 text-xl text-forest/70 items-start group">
                  <span className="text-clay mt-1.5 shrink-0 group-hover:scale-150 transition-transform duration-500 font-display font-black opacity-20 text-4xl leading-none">{idx + 1}</span>
                  <span className="group-hover:text-forest transition-colors leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div className="col-span-1 space-y-16">
            <h3 className="text-3xl font-black font-display">{lang === 'zh' ? '治理与未来 / GOVERNANCE' : 'GOVERNANCE'}</h3>
            <div className="space-y-8">
              <div className="p-10 bg-beige rounded-[40px] border border-forest/5 hover:border-clay/20 transition-all duration-500 hover:bg-white hover:shadow-xl">
                <span className="text-[10px] font-black text-clay block mb-4 uppercase tracking-[0.3em]">{t('section_action.eu_title')}</span>
                <p className="text-base leading-relaxed opacity-70 editorial-text">{t('section_action.eu_desc')}</p>
              </div>
              <div className="p-10 bg-beige rounded-[40px] border border-forest/5 hover:border-clay/20 transition-all duration-500 hover:bg-white hover:shadow-xl">
                <span className="text-[10px] font-black text-clay block mb-4 uppercase tracking-[0.3em]">{t('section_action.un_title')}</span>
                <p className="text-base leading-relaxed opacity-70 editorial-text">{t('section_action.un_desc')}</p>
              </div>
              {/* Optional: China Measures if translations exist */}
              {t('section_action.cn_title') && (
                <div className="p-10 bg-beige rounded-[40px] border border-forest/5 hover:border-clay/20 transition-all duration-500 hover:bg-white hover:shadow-xl">
                  <span className="text-[10px] font-black text-clay block mb-4 uppercase tracking-[0.3em]">{t('section_action.cn_title')}</span>
                  <p className="text-base leading-relaxed opacity-70 editorial-text">{t('section_action.cn_desc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Major Resources Library */}
      <section id="resources" className="py-64 px-6 max-w-7xl mx-auto border-t border-forest/5">
        <div className="mb-24 text-center">
          <h2 className="theme-label">{t('section_resources.title')}</h2>
          <h3 className="section-title">{t('section_resources.subtitle')}</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Resource 1: IEA Electricity 2026 */}
          <a href="https://www.iea.org/reports/electricity-2026" target="_blank" rel="noopener noreferrer" className="group">
            <div className="bg-white p-10 rounded-[48px] border border-forest/5 shadow-sm hover:shadow-2xl hover:border-clay/20 transition-all duration-500 h-full flex flex-col">
              <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-forest mb-8 group-hover:bg-forest group-hover:text-white transition-colors">
                <Zap size={24} />
              </div>
              <h4 className="text-xl font-black mb-4 group-hover:text-clay transition-colors">Electricity 2026</h4>
              <p className="text-sm text-forest/60 leading-relaxed font-serif italic mb-8 grow">
                {t('section_resources.iea_electricity_2026')}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-clay opacity-60">
                IEA REPORT <ExternalLink size={12} />
              </div>
            </div>
          </a>

          {/* Resource 2: AI and Climate Change */}
          <a href="https://www.iea.org/reports/energy-and-ai/ai-and-climate-change" target="_blank" rel="noopener noreferrer" className="group">
            <div className="bg-white p-10 rounded-[48px] border border-forest/5 shadow-sm hover:shadow-2xl hover:border-clay/20 transition-all duration-500 h-full flex flex-col">
              <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-forest mb-8 group-hover:bg-forest group-hover:text-white transition-colors">
                <Wind size={24} />
              </div>
              <h4 className="text-xl font-black mb-4 group-hover:text-clay transition-colors">AI and Climate Change</h4>
              <p className="text-sm text-forest/60 leading-relaxed font-serif italic mb-8 grow">
                {t('section_resources.iea_ai_climate')}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-clay opacity-60">
                IEA ANALYSIS <ExternalLink size={12} />
              </div>
            </div>
          </a>

          {/* Resource 3: Les sacrifiés de l'AI */}
          <a href="https://delano.lu/article/les-sacrifies-de-lai-an-illustration-of-datacolonialism" target="_blank" rel="noopener noreferrer" className="group">
            <div className="bg-white p-10 rounded-[48px] border border-forest/5 shadow-sm hover:shadow-2xl hover:border-clay/20 transition-all duration-500 h-full flex flex-col">
              <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-forest mb-8 group-hover:bg-forest group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h4 className="text-xl font-black mb-4 group-hover:text-clay transition-colors">Les sacrifiés de l‘AI</h4>
              <p className="text-sm text-forest/60 leading-relaxed font-serif italic mb-8 grow">
                {t('section_resources.les_sacrifies')}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-clay opacity-60">
                DOCUMENTARY <ExternalLink size={12} />
              </div>
            </div>
          </a>

          {/* Resource 4: The AI Doc */}
          <a href="https://moviesanywhere.com/movie/the-ai-doc-or-how-i-became-an-apocaloptimist-2026" target="_blank" rel="noopener noreferrer" className="group">
            <div className="bg-white p-10 rounded-[48px] border border-forest/5 shadow-sm hover:shadow-2xl hover:border-clay/20 transition-all duration-500 h-full flex flex-col">
              <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-forest mb-8 group-hover:bg-forest group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-black mb-4 group-hover:text-clay transition-colors">The AI Doc (2026)</h4>
              <p className="text-sm text-forest/60 leading-relaxed font-serif italic mb-8 grow">
                {t('section_resources.apocaloptimist')}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-clay opacity-60">
                FOCUS FEATURES <ExternalLink size={12} />
              </div>
            </div>
          </a>
        </div>

        {/* Previous Academic Links as horizontal list */}
        <div className="mt-32 pt-16 border-t border-forest/5 grid md:grid-cols-2 gap-12">
          <a href="https://mlco2.github.io/impact/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-8 group">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-clay transition-colors">
              <Zap size={32} className="text-white" />
            </div>
            <div>
              <h5 className="text-lg font-black uppercase tracking-widest text-forest group-hover:text-clay transition-colors">MLCO2 IMPACT</h5>
              <p className="text-xs opacity-50 font-serif italic">{t('section_action.mlco2_desc')}</p>
            </div>
          </a>
          <a href="https://www.oii.ox.ac.uk/research/projects/fairwork/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-8 group">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-clay transition-colors">
              <AlertCircle size={32} className="text-white" />
            </div>
            <div>
              <h5 className="text-lg font-black uppercase tracking-widest text-forest group-hover:text-clay transition-colors">HIDDEN FRONTIER</h5>
              <p className="text-xs opacity-50 font-serif italic">{t('section_action.hidden_desc')}</p>
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 bg-white border-t border-forest/10 flex flex-col md:flex-row justify-between items-center opacity-40 text-[10px] font-bold uppercase tracking-[0.2em] gap-8">
        <div className="text-center md:text-left max-w-xl leading-loose">
          {t('footer.data_source')}
        </div>
        <div className="flex items-center gap-6">
          <span>© 2026 Token Trace</span>
          <div className="w-1 h-1 bg-clay rounded-full" />
          <span className="text-clay">{t('footer.tagline')}</span>
        </div>
      </footer>

      {/* Floating Footprint Button */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-10 right-10 z-50 px-[20px] py-[10px] bg-clay text-white rounded-[30px] shadow-lg flex items-center gap-[8px] font-[600] text-sm cursor-pointer hover:scale-105 transition-transform font-sans"
      >
        {t('drawer.title')} <span className="font-mono text-base">→</span>
      </button>

      {/* Footprint Drawer (Modal) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsDrawerOpen(false)}
               className="fixed inset-0 bg-forest/80 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed inset-y-0 right-0 w-full max-w-sm bg-beige z-[110] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-forest font-sans">
                  <History className="text-clay" /> {t('drawer.title')}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-forest/5 transition-colors">
                  <X />
                </button>
              </div>

              <div className="space-y-12 flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border border-forest/5 shadow-sm text-center group hover:border-clay/30 transition-all">
                    <span className="text-[10px] uppercase font-black tracking-widest text-clay opacity-60 block mb-2">{t('drawer.visits')}</span>
                    <span className="font-display font-black text-4xl text-forest">{footprint.visits}</span>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-forest/5 shadow-sm text-center group hover:border-clay/30 transition-all">
                    <span className="text-[10px] uppercase font-black tracking-widest text-clay opacity-60 block mb-2">{t('drawer.tokens')}</span>
                    <span className="font-display font-black text-4xl text-forest">{footprint.tokens.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-white rounded-[40px] border border-forest/5 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                             <Droplet className="text-blue-500" size={24} />
                          </div>
                          <span className="font-display font-black text-lg">{t('drawer.water')}</span>
                       </div>
                       <div className="text-[10px] px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black uppercase tracking-wider">
                          {t('drawer.water_bottles', { count: (footprint.water / 500).toFixed(0) })}
                       </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="font-display font-black text-5xl">{(footprint.water / 1000).toFixed(3)}</span>
                       <span className="text-sm font-black opacity-30">{lang === 'zh' ? '升 / LITERS' : 'LITERS'}</span>
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-[40px] border border-forest/5 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                             <Wind className="text-emerald-500" size={24} />
                          </div>
                          <span className="font-display font-black text-lg">{t('drawer.carbon')}</span>
                       </div>
                       <div className="text-[10px] px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black uppercase tracking-wider">
                          {t('drawer.co2_driving', { count: (footprint.co2 / 190).toFixed(1) })}
                       </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="font-display font-black text-5xl">{(footprint.co2 / 1000).toFixed(3)}</span>
                       <span className="text-sm font-black opacity-30">{lang === 'zh' ? '公斤 / KG CO₂' : 'KG CO₂'}</span>
                    </div>
                  </div>
                </div>

              <div className="p-10 bg-forest rounded-[48px] text-beige text-base leading-relaxed relative overflow-hidden">
                  <div className="relative z-10">
                    <Info size={32} className="text-clay mb-6" />
                    <p className="font-serif italic text-lg opacity-80 leading-relaxed mb-4">{t('drawer.insight_quote')}</p>
                    <p className="text-sm opacity-50 mb-6 italic">{t('drawer.source_snippet')}</p>
                    <p className="text-[10px] opacity-30">{t('drawer.source_footer')}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <Globe size={100} />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-forest/5">
                <button 
                   onClick={handleClearData}
                   className="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-400 border border-red-400/20 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> {t('drawer.btn_clear')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
