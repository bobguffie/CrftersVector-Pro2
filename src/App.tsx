import * as React from 'react';
import { useState, useEffect, useRef, useCallback, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  Layers, 
  Settings, 
  Download, 
  Trash2, 
  Plus, 
  Minus, 
  Maximize2, 
  Lock, 
  Unlock,
  Wand2,
  Scissors,
  Combine,
  Eraser,
  Save,
  LogOut,
  LogIn,
  Zap,
  ChevronRight,
  ChevronLeft,
  Type,
  Palette,
  FlipHorizontal,
  FlipVertical,
  Square,
  Circle as CircleIcon,
  Star,
  Layers as LayersIcon,
  ArrowUp,
  ArrowDown,
  Ungroup,
  Link as LinkIcon,
  RotateCcw,
  Pipette,
  CheckCircle,
  Target,
  Crosshair,
  Key,
  X,
  PlusCircle,
  Edit2,
  ExternalLink
} from 'lucide-react';
import * as fabric from 'fabric';
import { generateImage } from './services/gemini';
import { traceImage, TraceOptions } from './services/tracer';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import paper from 'paper';
import { Sun, Moon, Hand, Copy, Link, Unlink } from 'lucide-react';

interface APIKey {
  id: string;
  label: string;
  key: string;
}

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  apiKeys, 
  setApiKeys, 
  activeKeyId, 
  setActiveKeyId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  apiKeys: APIKey[]; 
  setApiKeys: React.Dispatch<React.SetStateAction<APIKey[]>>;
  activeKeyId: string | null;
  setActiveKeyId: (id: string | null) => void;
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');

  const addKey = () => {
    if (!newLabel || !newKey) return;
    const newApiKey: APIKey = {
      id: Math.random().toString(36).substr(2, 9),
      label: newLabel,
      key: newKey
    };
    const updatedKeys = [...apiKeys, newApiKey];
    setApiKeys(updatedKeys);
    if (!activeKeyId) setActiveKeyId(newApiKey.id);
    setNewLabel('');
    setNewKey('');
  };

  const deleteKey = (id: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(updatedKeys);
    if (activeKeyId === id) {
      setActiveKeyId(updatedKeys.length > 0 ? updatedKeys[0].id : null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Gemini API Keys</h3>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"
              >
                Get API Key <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{k.label}</p>
                    <p className="text-xs text-stone-400 font-mono truncate">••••••••{k.key.slice(-4)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveKeyId(k.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeKeyId === k.id ? 'bg-emerald-500 text-white' : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'}`}
                    >
                      {activeKeyId === k.id ? 'Active' : 'Set Active'}
                    </button>
                    <button 
                      onClick={() => deleteKey(k.id)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-4">
              <p className="text-xs font-bold text-stone-500">Add New Key</p>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (e.g. Pro Tier)"
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <input 
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="API Key (AIzaSy...)"
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                />
              </div>
              <button 
                onClick={addKey}
                disabled={!newLabel || !newKey}
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-all"
              >
                <PlusCircle size={16} /> Add Key
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SelectionDimensions = ({ dimensions, zoom, viewportTransform }: { dimensions: any, zoom: number, viewportTransform: number[] }) => {
  if (!dimensions || !dimensions.visible) return null;

  const pixelsPerInch = 96;
  const widthInches = Math.round((dimensions.width / pixelsPerInch) * 100) / 100;
  const heightInches = Math.round((dimensions.height / pixelsPerInch) * 100) / 100;

  // Calculate screen position
  const screenLeft = dimensions.left * zoom + viewportTransform[4];
  const screenTop = dimensions.top * zoom + viewportTransform[5];
  const screenWidth = dimensions.width * zoom;
  
  return (
    <div 
      className="absolute pointer-events-none z-50 flex flex-col items-center"
      style={{
        left: screenLeft + screenWidth / 2,
        top: screenTop - 35, // Above the selection
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-stone-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg whitespace-nowrap border border-white/10">
        {widthInches}" x {heightInches}"
      </div>
    </div>
  );
};

export default function App() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'generate' | 'trace' | 'edit' | 'canvas'>('generate');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [traceOptions, setTraceOptions] = useState<TraceOptions>({
    colors: 4,
    blur: 0,
    pathOmit: 10,
    ltres: 1.5,
    qtres: 1.5,
    despeckle: 25,
    mincolorratio: 0.05,
    strokewidth: 0
  });
  const [detectedColors, setDetectedColors] = useState<{ r: number, g: number, b: number, a: number, hex: string, selected: boolean }[]>([]);
  const [colorTolerance, setColorTolerance] = useState(20);
  const [isLineArtMode, setIsLineArtMode] = useState(false);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [matSize, setMatSize] = useState<'12x12' | '12x24' | 'A4'>('12x12');
  const [canvasSize, setCanvasSize] = useState({ width: 1152, height: 1152 });
  const [showGrid, setShowGrid] = useState(true);
  const [viewportTransform, setViewportTransform] = useState<number[]>([1, 0, 0, 1, 0, 0]);
  const [isPanning, setIsPanning] = useState(false);
  const [handToolActive, setHandToolActive] = useState(false);
  const [watermark, setWatermark] = useState('');
  const [bgColor, setBgColor] = useState('transparent');
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [isTracing, setIsTracing] = useState(false);
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [watermarkObj, setWatermarkObj] = useState<fabric.Text | null>(null);
  const [tileWatermark, setTileWatermark] = useState(false);
  const [contourWidth, setContourWidth] = useState(0);
  const [contourColor, setContourColor] = useState('#ffffff');
  const [selectionDimensions, setSelectionDimensions] = useState<{ width: number, height: number, left: number, top: number, visible: boolean } | null>(null);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [propertyBarValues, setPropertyBarValues] = useState({ w: '', h: '' });
  const [activeObjectType, setActiveObjectType] = useState<string | null>(null);
  const [activeObjectColor, setActiveObjectColor] = useState<string>('#e2e2e2');
  const [activeObjectStrokeColor, setActiveObjectStrokeColor] = useState<string>('#000000');
  const [textSettings, setTextSettings] = useState({ font: 'Arial', color: '#000000' });
  const [numPaletteColors, setNumPaletteColors] = useState(3);
  const [paletteColors, setPaletteColors] = useState<string[]>(['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF']);
  const [swappingColor, setSwappingColor] = useState<{ original: string, current: string } | null>(null);
  const [knockoutColorValue, setKnockoutColorValue] = useState('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const matRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const lastTracedObjectRef = useRef<fabric.FabricObject | null>(null);
  const lastUploadedImageRef = useRef<fabric.FabricImage | null>(null);
  const gridGroupRef = useRef<fabric.Group | null>(null);

  const isHistoryLoading = useRef(false);

  const renderGrid = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Remove existing grid group if it exists (legacy)
    if (gridGroupRef.current) {
      canvas.remove(gridGroupRef.current);
      gridGroupRef.current = null;
    }

    let width = 1152; // 12 inches * 96 DPI
    let height = 1152; // 12 inches * 96 DPI

    if (matSize === '12x24') {
      height = 2304;
    } else if (matSize === 'A4') {
      width = Math.round(8.27 * 96);
      height = Math.round(11.69 * 96);
    }

    // Update canvas size if it changed
    if (canvasSize.width !== width || canvasSize.height !== height) {
      setCanvasSize({ width, height });
      canvas.setDimensions({ width, height });
    }

    // Set background color
    canvas.backgroundColor = theme === 'dark' ? '#1c1917' : '#ffffff';
    if (bgColor) canvas.backgroundColor = bgColor;

    // Remove legacy after:render grid
    canvas.off('after:render');
    
    canvas.renderAll();
  }, [matSize, theme, canvasSize, bgColor]);

  useEffect(() => {
    renderGrid();
  }, [matSize, showGrid, theme, bgColor, renderGrid]);

  const saveHistory = useCallback(() => {
    if (isHistoryLoading.current) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toObject(['id', 'isContour', 'parentId', 'name', 'selectable', 'evented', 'paintFirst', 'strokeUniform', 'exportChecked']));
    if (historyRef.current[historyIndexRef.current] === json) return;
    
    const newHistory = [...historyRef.current.slice(0, historyIndexRef.current + 1), json];
    if (newHistory.length > 30) newHistory.shift();
    
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, []);

  const updateLayers = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const objs = canvas.getObjects().filter(o => 
      o.visible && 
      (o instanceof fabric.FabricImage || o instanceof fabric.Path || o.type === 'group' || o.type === 'path' || o.type === 'image') && 
      (o as any).id !== 'grid-group' && 
      (o as any).id !== 'background_rect' &&
      (o as any).id !== 'watermark' &&
      (o as any).id !== 'watermark-tile'
    ).map((o: any) => {
      if (!o.id) {
        o.id = Math.random().toString(36).substr(2, 9);
      }
      return {
        id: o.id,
        type: o.type,
        fill: o.fill || (o as any)._objects?.[0]?.fill || (o instanceof fabric.FabricImage ? 'transparent' : '#000000'),
        visible: o.visible,
        exportChecked: o.exportChecked !== undefined ? o.exportChecked : true,
        name: (o as any).name || (o instanceof fabric.FabricImage ? 'Image Layer' : `Layer ${o.type}`)
      };
    });
    setLayers(objs.reverse());
  };

  const handlePropertyChange = (type: 'w' | 'h', value: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    setPropertyBarValues(prev => ({ ...prev, [type]: value }));

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    const pixels = numValue * 96;
    if (type === 'w') {
      if (isAspectRatioLocked) {
        activeObject.scaleToWidth(pixels);
      } else {
        activeObject.set('scaleX', pixels / activeObject.width!);
      }
    } else {
      if (isAspectRatioLocked) {
        activeObject.scaleToHeight(pixels);
      } else {
        activeObject.set('scaleY', pixels / activeObject.height!);
      }
    }

    activeObject.setCoords();
    canvas.renderAll();
    saveHistory();
    updateLayers();
    
    // Update selection dimensions for the overlay
    const rect = activeObject.getBoundingRect();
    const w = activeObject.width! * activeObject.scaleX!;
    const h = activeObject.height! * activeObject.scaleY!;
    setSelectionDimensions({
      width: w,
      height: h,
      left: rect.left,
      top: rect.top,
      visible: true
    });
    
    // Update the OTHER value if locked
    if (isAspectRatioLocked) {
      setPropertyBarValues({
        w: (w / 96).toFixed(2),
        h: (h / 96).toFixed(2)
      });
    }
  };

  const handleFlipHorizontal = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    activeObject.set('flipX', !activeObject.flipX);
    canvas.renderAll();
    saveHistory();
  };

  const handleFlipVertical = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    activeObject.set('flipY', !activeObject.flipY);
    canvas.renderAll();
    saveHistory();
  };

  const handleKnockout = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    const currentFill = activeObject.fill;
    if (currentFill && currentFill !== 'transparent' && currentFill !== 'rgba(0,0,0,0)') {
      const strokeColor = typeof currentFill === 'string' ? currentFill : activeObjectStrokeColor;
      activeObject.set({
        fill: 'rgba(0,0,0,0)',
        stroke: strokeColor,
        strokeWidth: 2
      });
      setActiveObjectColor('transparent');
      setActiveObjectStrokeColor(strokeColor);
    }
    canvas.renderAll();
    saveHistory();
    updateLayers();
  };

  const handleColorChange = (color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    if (color === 'transparent') {
      const currentFill = activeObject.fill;
      const strokeColor = (typeof currentFill === 'string' && currentFill !== 'transparent' && currentFill !== 'rgba(0,0,0,0)') ? currentFill : activeObjectStrokeColor;
      activeObject.set({
        fill: 'rgba(0,0,0,0)',
        stroke: strokeColor,
        strokeWidth: 2
      });
      setActiveObjectColor('transparent');
      setActiveObjectStrokeColor(strokeColor);
    } else {
      activeObject.set({
        fill: color,
        strokeWidth: 0
      });
      setActiveObjectColor(color);
    }
    
    canvas.renderAll();
    saveHistory();
    updateLayers();
  };

  const handleBorderColorChange = (color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    activeObject.set({
      stroke: color,
      strokeWidth: activeObject.strokeWidth || 2
    });
    setActiveObjectStrokeColor(color);
    canvas.renderAll();
    saveHistory();
    updateLayers();
  };

  const toggleLayerExport = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o: any) => (o as any).id === id);
    if (obj) {
      (obj as any).exportChecked = (obj as any).exportChecked !== undefined ? !(obj as any).exportChecked : false;
      updateLayers();
    }
  };

  const updateLayerColor = (id: string, color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o: any) => (o as any).id === id);
    if (obj) {
      obj.set('fill', color);
      canvas.renderAll();
      saveHistory();
      updateLayers();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !handToolActive) {
        setHandToolActive(true);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.defaultCursor = 'grab';
          (fabricCanvasRef.current as any).isHandToolActive = true;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD') {
        e.preventDefault();
        handleDuplicate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setHandToolActive(false);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.defaultCursor = 'default';
          (fabricCanvasRef.current as any).isHandToolActive = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handToolActive]);

  // Load initial data from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('crafters_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }

    const savedKeys = localStorage.getItem('crafters_api_keys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKeys(keys);
        const savedActiveId = localStorage.getItem('crafters_active_key_id');
        if (savedActiveId && keys.some((k: APIKey) => k.id === savedActiveId)) {
          setActiveKeyId(savedActiveId);
        } else if (keys.length > 0) {
          setActiveKeyId(keys[0].id);
        }
      } catch (e) {
        console.error("Failed to load API keys", e);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('crafters_projects', JSON.stringify(projects));
  }, [projects]);

  // Save API keys to localStorage
  useEffect(() => {
    localStorage.setItem('crafters_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Save active key ID to localStorage
  useEffect(() => {
    if (activeKeyId) {
      localStorage.setItem('crafters_active_key_id', activeKeyId);
    }
  }, [activeKeyId]);

  const activeKey = apiKeys.find(k => k.id === activeKeyId)?.key || null;

  // Sync hand tool state to canvas
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.defaultCursor = handToolActive ? 'grab' : 'default';
    }
  }, [handToolActive]);

  // Fabric.js Initialization
  useEffect(() => {
    if (containerRef.current && canvasRef.current && !fabricCanvasRef.current) {
      console.log('Initializing Fabric Canvas');
      const container = containerRef.current;
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 'transparent',
      });
      fabricCanvasRef.current = fabricCanvas;

      // Listen to viewport changes for CSS grid
      fabricCanvas.on('after:render', () => {
        if (fabricCanvas.viewportTransform) {
          setViewportTransform([...fabricCanvas.viewportTransform]);
        }
      });

      const updateSelectionDimensions = () => {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
          const rect = activeObject.getBoundingRect();
          const w = activeObject.width! * activeObject.scaleX!;
          const h = activeObject.height! * activeObject.scaleY!;
          setSelectionDimensions({
            width: w,
            height: h,
            left: rect.left,
            top: rect.top,
            visible: true
          });
          setPropertyBarValues({
            w: (w / 96).toFixed(2),
            h: (h / 96).toFixed(2)
          });
          setActiveObjectType(activeObject.type);
          setActiveObjectColor(typeof activeObject.fill === 'string' ? activeObject.fill : '#e2e2e2');
          setActiveObjectStrokeColor(typeof activeObject.stroke === 'string' ? activeObject.stroke : '#000000');
        } else {
          setSelectionDimensions(null);
          setPropertyBarValues({ w: '', h: '' });
          setActiveObjectType(null);
        }
      };

      fabricCanvas.on('selection:created', updateSelectionDimensions);
      fabricCanvas.on('selection:updated', updateSelectionDimensions);
      fabricCanvas.on('selection:cleared', () => setSelectionDimensions(null));
      fabricCanvas.on('object:scaling', updateSelectionDimensions);
      fabricCanvas.on('object:moving', updateSelectionDimensions);

      // Panning Logic
      fabricCanvas.on('mouse:down', function(opt) {
        const evt = opt.e as any;
        if (evt.altKey || (this as any).isHandToolActive) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
      fabricCanvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
          const e = opt.e as any;
          const vpt = this.viewportTransform!;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
      fabricCanvas.on('mouse:up', function() {
        this.setViewportTransform(this.viewportTransform!);
        this.isDragging = false;
        this.selection = true;
      });

      // Center mat initially
      const initialZoom = 0.7;
      const vpt = fabricCanvas.viewportTransform!;
      vpt[0] = initialZoom;
      vpt[3] = initialZoom;
      vpt[4] = (container.clientWidth - canvasSize.width * initialZoom) / 2;
      vpt[5] = (container.clientHeight - canvasSize.height * initialZoom) / 2;
      fabricCanvas.setZoom(initialZoom);
      setZoomLevel(initialZoom);
      fabricCanvas.requestRenderAll();

      updateWatermark();

      fabricCanvas.on('mouse:wheel', (opt) => {
        if (!opt.e.ctrlKey) return;
        const delta = opt.e.deltaY;
        let zoom = fabricCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;
        fabricCanvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        setZoomLevel(zoom);
      });

      fabricCanvas.on('object:added', () => {
        saveHistory();
        updateLayers();
        updateWatermark();
      });
      fabricCanvas.on('object:modified', () => {
        saveHistory();
        updateLayers();
      });
      fabricCanvas.on('object:removed', () => {
        saveHistory();
        updateLayers();
      });
      fabricCanvas.on('selection:created', (e) => {
        if (e.selected && e.selected[0]) {
          setSelectedLayerId((e.selected[0] as any).id || null);
          const active = e.selected[0];
          const parentId = (active as any).id;
          const contour = fabricCanvas.getObjects().find(o => (o as any).isContour && (o as any).parentId === parentId) as fabric.Path;
          if (contour) {
            setContourWidth(contour.strokeWidth! / 2);
          } else {
            setContourWidth(0);
          }
        }
      });
      fabricCanvas.on('selection:updated', (e) => {
        if (e.selected && e.selected[0]) {
          setSelectedLayerId((e.selected[0] as any).id || null);
          const active = e.selected[0];
          const parentId = (active as any).id;
          const contour = fabricCanvas.getObjects().find(o => (o as any).isContour && (o as any).parentId === parentId) as fabric.Path;
          if (contour) {
            setContourWidth(contour.strokeWidth! / 2);
          } else {
            setContourWidth(0);
          }
        }
      });
      fabricCanvas.on('selection:cleared', () => {
        setSelectedLayerId(null);
      });

      saveHistory(); // Capture initial state

      return () => {
        fabricCanvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, []);

  // Handle Resize
  useEffect(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        fabricCanvasRef.current?.setDimensions({ width, height });
        fabricCanvasRef.current?.requestRenderAll();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleHistory = () => saveHistory();

    canvas.on('object:added', handleHistory);
    canvas.on('object:modified', handleHistory);
    canvas.on('object:removed', handleHistory);

    return () => {
      canvas.off('object:added', handleHistory);
      canvas.off('object:modified', handleHistory);
      canvas.off('object:removed', handleHistory);
    };
  }, [saveHistory]);

  // Update Canvas Dimensions
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({
        width: canvasSize.width,
        height: canvasSize.height
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [canvasSize]);

  // Manual Tracing Workflow - Effect removed

  const vacuumTinyBits = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    let removedCount = 0;
    
    objects.forEach(obj => {
      if (obj instanceof fabric.Path || obj.type === 'path') {
        const bounds = obj.getBoundingRect();
        if (bounds.width < 7 || bounds.height < 7) {
          canvas.remove(obj);
          removedCount++;
        }
      }
    });
    
    if (removedCount > 0) {
      canvas.renderAll();
      saveHistory();
      alert(`Vacuumed ${removedCount} tiny artifacts!`);
    } else {
      alert("No tiny artifacts found.");
    }
  };

  const resetCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    if (window.confirm("Are you sure you want to clear the entire canvas? This cannot be undone.")) {
      canvas.clear();
      canvas.backgroundColor = bgColor;
      updateWatermark();
      canvas.renderAll();
      saveHistory();
    }
  };

  const resetView = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !containerRef.current) return;

    const container = containerRef.current;
    const vpt = canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0];
    
    // Reset zoom
    setZoomLevel(1);
    canvas.setZoom(1);

    // Center the mat
    const x = (container.clientWidth - canvasSize.width) / 2;
    const y = (container.clientHeight - canvasSize.height) / 2;
    
    vpt[4] = x;
    vpt[5] = y;
    canvas.setViewportTransform(vpt);
    setViewportTransform(vpt);
    canvas.renderAll();
  }, [canvasSize]);

  const extractColors = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const scale = Math.min(100 / img.width, 100 / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: { [key: string]: { r: number, g: number, b: number, a: number, count: number } } = {};
      
      const factor = Math.max(1, Math.round(colorTolerance / 4));

      for (let i = 0; i < imageData.length; i += 4) {
        let r = imageData[i];
        let g = imageData[i + 1];
        let b = imageData[i + 2];
        const a = imageData[i + 3];
        if (a < 128) continue;
        
        r = Math.round(r / factor) * factor;
        g = Math.round(g / factor) * factor;
        b = Math.round(b / factor) * factor;
        
        const key = `${r},${g},${b}`;
        if (!colorCounts[key]) {
          colorCounts[key] = { r, g, b, a, count: 0 };
        }
        colorCounts[key].count++;
      }
      
      const sortedColors = Object.values(colorCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map((c, index) => ({
          ...c,
          hex: `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`,
          selected: index < 3
        }));
        
      setDetectedColors(sortedColors);
    };
    img.src = imageUrl;
  };

  useEffect(() => {
    if (sourceImage) {
      extractColors(sourceImage);
    }
  }, [sourceImage, colorTolerance]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.TPointerEventInfo) => {
      if (!isEyedropperActive) return;
      
      const pointer = canvas.getScenePoint(opt.e);
      const ctx = canvas.getContext();
      const pixel = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const a = pixel[3];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      
      setDetectedColors(prev => {
        if (prev.some(c => c.hex.toLowerCase() === hex.toLowerCase())) return prev;
        return [...prev, { r, g, b, a, hex, selected: true }];
      });
      
      setIsEyedropperActive(false);
      canvas.defaultCursor = 'default';
    };

    canvas.on('mouse:down', handleMouseDown);
    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [isEyedropperActive]);

  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    
    isHistoryLoading.current = true;
    const newIndex = historyIndexRef.current - 1;
    const state = historyRef.current[newIndex];
    if (!state) {
      isHistoryLoading.current = false;
      return;
    }
    canvas.loadFromJSON(JSON.parse(state)).then(() => {
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      canvas.renderAll();
      isHistoryLoading.current = false;
    });
  };

  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    
    isHistoryLoading.current = true;
    const newIndex = historyIndexRef.current + 1;
    const state = historyRef.current[newIndex];
    if (!state) {
      isHistoryLoading.current = false;
      return;
    }
    canvas.loadFromJSON(JSON.parse(state)).then(() => {
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      canvas.renderAll();
      isHistoryLoading.current = false;
    });
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      let finalPrompt = prompt;
      if (isLineArtMode) {
        const colorsStr = paletteColors.slice(0, numPaletteColors).join(', ');
        finalPrompt += `, black and white vector line art, thick bold outlines, flat white background, no shading, no gradients, coloring book style, high contrast, closed paths, clean lines. USE ONLY the colors [${colorsStr}] with flat shading and no blending.`;
      }
      const imageUrl = await generateImage(finalPrompt, activeKey || undefined);
      console.log('AI Generation Result:', imageUrl ? 'Success (URL received)' : 'Failed (null)');
      if (imageUrl) {
        console.log('Image Generated via AI');
        setSourceImage(imageUrl);
        
        // Add to canvas immediately so user sees it
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          if (lastUploadedImageRef.current) {
            canvas.remove(lastUploadedImageRef.current);
          }
          fabric.FabricImage.fromURL(imageUrl).then((img) => {
            img.scaleToWidth(canvas.getWidth() * 0.5);
            img.set({
              left: canvas.getCenterPoint().x,
              top: canvas.getCenterPoint().y,
              originX: 'center',
              originY: 'center'
            });
            img.setCoords();
            canvas.add(img);
            canvas.setActiveObject(img);
            lastUploadedImageRef.current = img;
            canvas.renderAll();
          });
        }
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File detected:', file.name);
      const blobUrl = URL.createObjectURL(file);
      console.log('Image Uploaded (Blob)');
      setSourceImage(blobUrl);
      
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        // Remove previous uploaded image if any
        if (lastUploadedImageRef.current) {
          canvas.remove(lastUploadedImageRef.current);
        }
        
        fabric.FabricImage.fromURL(blobUrl, { 
          crossOrigin: 'anonymous',
          // @ts-ignore
          cacheKey: new Date().getTime().toString()
        }).then((img) => {
          img.scaleToWidth(canvas.getWidth() * 0.5);
          img.set({
            left: canvas.getCenterPoint().x,
            top: canvas.getCenterPoint().y,
            originX: 'center',
            originY: 'center'
          });
          img.setCoords();
          canvas.add(img);
          canvas.setActiveObject(img);
          lastUploadedImageRef.current = img;
          (img as any).originalSrc = blobUrl; // Store for high-quality export
          canvas.renderAll();
        });
      }
    }
  };

  const cleanDesign = (objects: fabric.FabricObject[]) => {
    return objects.filter(obj => {
      // Artifact removal: delete any path with area < 15 pixels
      const bounds = obj.getBoundingRect();
      const area = bounds.width * bounds.height;
      return area >= 15;
    });
  };

  const applyTrace = async (imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !imageUrl) return;
    setIsTracing(true);
    try {
      console.log('Applying trace to image...');
      
      let selectedPal: { r: number, g: number, b: number, a: number }[] | undefined = undefined;
      
      if (isLineArtMode) {
        // Use the exact colors selected in the palette
        selectedPal = paletteColors.slice(0, numPaletteColors).map(hex => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { r, g, b, a: 255 };
        });
      } else {
        const detected = detectedColors.filter(c => c.selected);
        if (detected.length > 0) {
          selectedPal = detected.map(c => ({ r: c.r, g: c.g, b: c.b, a: c.a }));
        }
      }

      const options = { 
        ...traceOptions, 
        pal: selectedPal,
        treshold: 128, 
        mincolorerror: colorTolerance 
      };
      const svgString = await traceImage(imageUrl, options);
      console.log('SVG Generated successfully');
      
      const { objects } = await fabric.loadSVGFromString(svgString);
      const cleanedObjects = cleanDesign(objects.filter((obj): obj is fabric.FabricObject => obj !== null));
      
      // Group by color for professional layered SVG
      const colorGroups: { [key: string]: fabric.FabricObject[] } = {};
      cleanedObjects.forEach(obj => {
        const fill = (obj.fill as string) || 'none';
        if (!colorGroups[fill]) colorGroups[fill] = [];
        colorGroups[fill].push(obj);
      });

      // Remove old photo/SVG
      if (lastUploadedImageRef.current) {
        canvas.remove(lastUploadedImageRef.current);
        lastUploadedImageRef.current = null;
      }
      canvas.getObjects().forEach(o => {
        if (!(o instanceof fabric.FabricImage) && (o as any).id !== 'watermark') canvas.remove(o);
      });
      
      const layerGroups: fabric.Group[] = [];
      Object.entries(colorGroups).forEach(([color, objs], index) => {
        const group = fabric.util.groupSVGElements(objs, options);
        (group as any).id = `layer-${index}-${Date.now()}`;
        (group as any).name = `Color Group ${index + 1}`;
        layerGroups.push(group as fabric.Group);
      });

      const originalImage = lastUploadedImageRef.current;
      const originalWidth = originalImage?.getScaledWidth() || canvas.getWidth() * 0.8;
      const originalLeft = originalImage?.left || canvas.getWidth() / 2;
      const originalTop = originalImage?.top || canvas.getHeight() / 2;

      // Create a Master Group to keep layers aligned
      const masterGroup = new fabric.Group(layerGroups, {
        left: originalLeft,
        top: originalTop,
      });
      (masterGroup as any).id = `master-group-${Date.now()}`;
      (masterGroup as any).name = 'Master Vector Group';

      // Scale master group to match original image
      if (originalImage) {
        masterGroup.set({
          left: originalImage.left,
          top: originalImage.top,
          scaleX: (originalImage.getScaledWidth() / masterGroup.width!) * masterGroup.scaleX!,
          scaleY: (originalImage.getScaledHeight() / masterGroup.height!) * masterGroup.scaleY!,
          angle: originalImage.angle,
          flipX: originalImage.flipX,
          flipY: originalImage.flipY
        });
      }

      canvas.add(masterGroup);
      canvas.setActiveObject(masterGroup);
      
      // Center the view
      canvas.setZoom(1);
      setZoomLevel(1);
      canvas.absolutePan(new fabric.Point(0, 0));
      
      canvas.renderAll();
      saveHistory();
      updateLayers();
      
      if (activeTab !== 'edit') setActiveTab('edit');
    } catch (error) {
      console.error("Trace failed", error);
    } finally {
      setIsTracing(false);
    }
  };

  const releaseLayers = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active instanceof fabric.Group) {
      (active as any).toActiveSelection();
      canvas.requestRenderAll();
      saveHistory();
      updateLayers();
    }
  };

  const moveForward = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringForward(active);
      // Ensure watermark stays at front if exists
      const watermarks = canvas.getObjects().filter((o: any) => o.id === 'watermark' || o.id === 'watermark-tile');
      watermarks.forEach(wm => canvas.bringObjectToFront(wm));
      
      canvas.renderAll();
      saveHistory();
      updateLayers();
    }
  };

  const moveBackward = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendBackwards(active);
      // Ensure grid stays at back
      if (gridGroupRef.current) {
        canvas.sendObjectToBack(gridGroupRef.current);
      }
      canvas.renderAll();
      saveHistory();
      updateLayers();
    }
  };

  const handleZoom = (value: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = value / 100;
    canvas.setZoom(newZoom);
    setZoomLevel(newZoom);
    canvas.requestRenderAll();
  };

  const handleZoomIn = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(canvas.getZoom() * 1.1, 5);
    canvas.setZoom(newZoom);
    setZoomLevel(newZoom);
    canvas.requestRenderAll();
  };

  const handleZoomOut = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(canvas.getZoom() * 0.9, 0.1);
    canvas.setZoom(newZoom);
    setZoomLevel(newZoom);
    canvas.requestRenderAll();
  };

  const toggleLayerVisibility = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      obj.visible = !obj.visible;
      canvas.renderAll();
      setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: obj.visible } : l));
    }
  };

  const deleteLayer = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
  };

  const selectLayer = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      setSelectedLayerId(id);
    }
  };

  const updateCanvasWidth = (val: number) => {
    const ratio = canvasSize.width / canvasSize.height;
    const newHeight = aspectLocked ? Math.round(val / ratio) : canvasSize.height;
    setCanvasSize({ width: val, height: newHeight });
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width: val, height: newHeight });
      fabricCanvasRef.current.renderAll();
    }
  };

  const updateCanvasHeight = (val: number) => {
    const ratio = canvasSize.width / canvasSize.height;
    const newWidth = aspectLocked ? Math.round(val * ratio) : canvasSize.width;
    setCanvasSize({ width: newWidth, height: val });
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width: newWidth, height: val });
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleFlip = (dir: 'h' | 'v') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    if (dir === 'h') active.set('flipX', !active.flipX);
    else active.set('flipY', !active.flipY);
    canvas.renderAll();
    saveHistory();
  };

  const handleCenter = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.centerObject(active);
    canvas.renderAll();
    saveHistory();
  };

  const addShape = (type: 'rect' | 'circle' | 'star') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    let shape: fabric.FabricObject;
    const common = {
      left: canvas.getCenterPoint().x,
      top: canvas.getCenterPoint().y,
      fill: '#e2e2e2',
      stroke: '#000000',
      strokeWidth: 0,
      originX: 'center' as const,
      originY: 'center' as const,
    };

    if (type === 'rect') {
      shape = new fabric.Rect({ ...common, width: 100, height: 100 });
    } else if (type === 'circle') {
      shape = new fabric.Circle({ ...common, radius: 50 });
    } else {
      // Simple star using Polygon
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? 50 : 25;
        points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }
      shape = new fabric.Polygon(points, common);
    }
    (shape as any).id = `shape-${Date.now()}`;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveHistory();
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new fabric.Textbox('Double click to edit', {
      left: canvas.getCenterPoint().x,
      top: canvas.getCenterPoint().y,
      fontFamily: textSettings.font,
      fill: textSettings.color,
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      width: 200
    });
    (text as any).id = `text-${Date.now()}`;
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveHistory();
  };

  const applyContour = async (width: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    
    setContourWidth(width);

    // Generate a stable ID for the selection to track its contour
    let parentId = (active as any).id;
    if (!parentId) {
      if (active instanceof fabric.ActiveSelection) {
        const ids = active.getObjects().map(o => (o as any).id || ((o as any).id = `obj-${Math.random().toString(36).substr(2, 9)}`));
        parentId = `selection-${ids.sort().join('-')}`;
        (active as any).id = parentId;
      } else {
        parentId = (active as any).id = `obj-${Date.now()}`;
      }
    }

    if (width === 0) {
      const oldContour = canvas.getObjects().filter(o => (o as any).isContour && (o as any).parentId === parentId);
      oldContour.forEach(o => canvas.remove(o));
      canvas.renderAll();
      saveHistory();
      return;
    }

    setIsTracing(true);

    try {
      const bounds = active.getBoundingRect();
      const padding = width + 20;
      
      const tempFabricCanvas = new fabric.StaticCanvas(null, {
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2
      });
      
      const cloned = await active.clone();
      cloned.set({
        left: padding + (cloned.left! - bounds.left),
        top: padding + (cloned.top! - bounds.top)
      });
      
      const makeAlphaSilhouette = (obj: fabric.FabricObject) => {
        if (obj instanceof fabric.Group) {
          obj.getObjects().forEach(makeAlphaSilhouette);
        } else {
          if (obj instanceof fabric.FabricImage) {
            obj.filters = [
              new fabric.filters.ColorMatrix({
                matrix: [
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 1, 0
                ]
              })
            ];
            obj.applyFilters();
          } else {
            obj.set({
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: 0.1
            });
          }
        }
      };
      
      makeAlphaSilhouette(cloned);
      tempFabricCanvas.backgroundColor = '#FFFFFF';
      tempFabricCanvas.add(cloned);
      tempFabricCanvas.renderAll();
      
      const silhouetteUrl = tempFabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
      
      const svgString = await traceImage(silhouetteUrl, { 
        colors: 2, 
        ltres: 1, 
        qtres: 1,
        blur: 0,
        pathOmit: 2,
        despeckle: 2,
        strokewidth: 0
      });
      
      const { objects } = await fabric.loadSVGFromString(svgString);
      const paths = objects.filter((o): o is fabric.Path => o instanceof fabric.Path);
      
      if (paths.length > 0) {
        // Filter out the background rectangle if it was traced
        const mainPath = paths.sort((a, b) => (b.width! * b.height!) - (a.width! * a.height!))[0];
        
        // If the main path is the size of the canvas, it's the background
        if (mainPath.width! > tempFabricCanvas.width! - 5 && mainPath.height! > tempFabricCanvas.height! - 5) {
          // Take the second largest
          if (paths.length > 1) {
            const secondPath = paths.sort((a, b) => (b.width! * b.height!) - (a.width! * a.height!))[1];
            mainPath.set({
              path: secondPath.path,
              left: secondPath.left,
              top: secondPath.top,
              width: secondPath.width,
              height: secondPath.height
            });
          } else {
            return;
          }
        }
        
        mainPath.set({
          left: bounds.left - padding + (mainPath.left || 0),
          top: bounds.top - padding + (mainPath.top || 0),
          fill: contourColor,
          stroke: '#000000',
          strokeWidth: 1,
          strokeLineJoin: 'round',
          strokeLineCap: 'round',
          strokeUniform: true,
          selectable: false,
          evented: false,
          paintFirst: 'stroke'
        });

        // Remove internal holes by keeping only the largest sub-path
        const subPaths: any[][] = [];
        let currentSubPath: any[] = [];
        (mainPath.path as any).forEach((segment: any) => {
          if (segment[0] === 'M' && currentSubPath.length > 0) {
            subPaths.push(currentSubPath);
            currentSubPath = [];
          }
          currentSubPath.push(segment);
        });
        if (currentSubPath.length > 0) subPaths.push(currentSubPath);

        if (subPaths.length > 1) {
          let maxArea = -1;
          let largestSubPath = subPaths[0];
          subPaths.forEach(sp => {
            const tempPath = new fabric.Path(sp);
            const b = tempPath.getBoundingRect();
            const area = b.width * b.height;
            if (area > maxArea) {
              maxArea = area;
              largestSubPath = sp;
            }
          });
          mainPath.set({ path: largestSubPath });
        }

        // Apply expansion
        if (width > 0) {
          mainPath.set({
            strokeWidth: width * 2,
            stroke: '#FFFFFF',
            paintFirst: 'stroke'
          });

          // Add the thin black outline
          const outline = await mainPath.clone();
          outline.set({
            stroke: '#000000',
            strokeWidth: (width * 2) + 1.5,
            fill: 'transparent',
            paintFirst: 'stroke'
          });

          const oldContours = canvas.getObjects().filter(o => (o as any).isContour && (o as any).parentId === parentId);
          oldContours.forEach(o => canvas.remove(o));
          
          (mainPath as any).isContour = true;
          (mainPath as any).parentId = parentId;
          (outline as any).isContour = true;
          (outline as any).parentId = parentId;
          
          canvas.add(outline);
          canvas.add(mainPath);
          canvas.sendObjectToBack(outline);
          canvas.sendObjectToBack(mainPath);
        }

        canvas.renderAll();
        saveHistory();
      }
    } catch (error) {
      console.error("Contour failed", error);
    } finally {
      setIsTracing(false);
    }
  };

  const handleUngroup = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof fabric.Group)) return;
    
    active.getObjects().forEach(obj => {
      active.remove(obj);
      canvas.add(obj);
    });
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    saveHistory();
  };

  const handleAttach = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof fabric.ActiveSelection)) return;
    
    const group = (active as any).toGroup();
    (group as any).id = `attached-${Date.now()}`;
    (group as any).name = "Attached Layers";
    canvas.renderAll();
    saveHistory();
  };

  const handleReorder = (dir: 'front' | 'back') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    if (dir === 'front') {
      canvas.bringObjectToFront(active);
      // Ensure watermark stays at front if exists
      const watermarks = canvas.getObjects().filter((o: any) => o.id === 'watermark' || o.id === 'watermark-tile');
      watermarks.forEach(wm => canvas.bringObjectToFront(wm));
    } else {
      canvas.sendObjectToBack(active);
      // Ensure grid stays at back
      if (gridGroupRef.current) {
        canvas.sendObjectToBack(gridGroupRef.current);
      }
    }
    canvas.renderAll();
    saveHistory();
    updateLayers();
  };

  const updateWatermark = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const existing = canvas.getObjects().filter((o: any) => o.id === 'watermark' || o.id === 'watermark-tile');
    existing.forEach(o => canvas.remove(o));

    if (!watermark) return;

    if (tileWatermark) {
      // Create a tiled pattern
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 200;
      patternCanvas.height = 100;
      const ctx = patternCanvas.getContext('2d');
      if (ctx) {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(100, 50);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(watermark, 0, 0);
      }

      const rect = new fabric.Rect({
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        fill: new fabric.Pattern({
          source: patternCanvas,
          repeat: 'repeat'
        })
      });
      (rect as any).id = 'watermark-tile';
      canvas.add(rect);
      canvas.bringObjectToFront(rect);
    } else {
      const text = new fabric.Text(watermark, {
        fontSize: 40,
        fill: 'rgba(0,0,0,0.3)',
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        angle: -45
      });
      (text as any).id = 'watermark';
      canvas.add(text);
      canvas.bringObjectToFront(text);
    }
    canvas.renderAll();
  };

  useEffect(() => {
    updateWatermark();
  }, [watermark, tileWatermark]);

  const removeBackground = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof fabric.FabricImage)) {
      alert("Please select a raster image first.");
      return;
    }

    setIsTracing(true); // Reuse tracing state for loading
    try {
      const imgElement = active.getElement() as HTMLImageElement;
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      tempCanvas.width = imgElement.naturalWidth || imgElement.width;
      tempCanvas.height = imgElement.naturalHeight || imgElement.height;
      ctx.drawImage(imgElement, 0, 0);

      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Chroma Key logic: identify most common outer-edge color
      const edgeColors: { [key: string]: number } = {};
      const sampleEdge = (x: number, y: number) => {
        const i = (y * tempCanvas.width + x) * 4;
        const key = `${data[i]},${data[i+1]},${data[i+2]}`;
        edgeColors[key] = (edgeColors[key] || 0) + 1;
      };

      // Sample edges
      for (let x = 0; x < tempCanvas.width; x++) {
        sampleEdge(x, 0);
        sampleEdge(x, tempCanvas.height - 1);
      }
      for (let y = 0; y < tempCanvas.height; y++) {
        sampleEdge(0, y);
        sampleEdge(tempCanvas.width - 1, y);
      }

      const mostCommon = Object.entries(edgeColors).sort((a, b) => b[1] - a[1])[0][0];
      const [br, bg, bb] = mostCommon.split(',').map(Number);
      const tolerance = 40;

      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - br);
        const dg = Math.abs(data[i + 1] - bg);
        const db = Math.abs(data[i + 2] - bb);
        if (dr < tolerance && dg < tolerance && db < tolerance) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const newUrl = tempCanvas.toDataURL('image/png');
      
      fabric.FabricImage.fromURL(newUrl).then((newImg) => {
        newImg.set({
          left: active.left,
          top: active.top,
          scaleX: active.scaleX,
          scaleY: active.scaleY,
          angle: active.angle,
          flipX: active.flipX,
          flipY: active.flipY,
        });
        canvas.remove(active);
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        lastUploadedImageRef.current = newImg;
        canvas.renderAll();
        saveHistory();
      });
    } catch (error) {
      console.error("Background removal failed", error);
    } finally {
      setIsTracing(false);
    }
  };

  const generateCricutSVG = async (selectionOnly = false) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return '';

    const activeObject = canvas.getActiveObject();
    
    // Create a temporary canvas to work on for flattening
    const tempCanvas = new fabric.StaticCanvas(null, {
      width: canvas.getWidth(),
      height: canvas.getHeight()
    });

    // Clone objects to temp canvas
    const objectsToClone = (selectionOnly && activeObject) 
      ? (activeObject instanceof fabric.Group ? activeObject.getObjects() : [activeObject])
      : canvas.getObjects();

    for (const obj of objectsToClone) {
      const id = (obj as any).id;
      if (id === 'watermark' || id === 'watermark-tile' || id === 'background_rect' || id === 'grid-group' || id === 'grid-line') continue;
      
      // Filter by exportChecked
      if ((obj as any).exportChecked === false) continue;

      const cloned = await obj.clone(['id', 'isContour', 'parentId', 'name', 'selectable', 'evented', 'paintFirst', 'strokeUniform', 'exportChecked']);
      tempCanvas.add(cloned);
    }

    // Flatten all groups recursively
    let hasGroups = true;
    while (hasGroups) {
      hasGroups = false;
      const currentObjects = tempCanvas.getObjects();
      for (const obj of currentObjects) {
        if (obj instanceof fabric.Group) {
          const group = obj as fabric.Group;
          const matrix = group.calcTransformMatrix();
          const items = group.getObjects();
          
          items.forEach(item => {
            const transform = fabric.util.multiplyTransformMatrices(matrix, item.calcTransformMatrix());
            const options = fabric.util.qrDecompose(transform);
            
            item.set({
              left: options.translateX,
              top: options.translateY,
              angle: options.angle,
              scaleX: options.scaleX,
              scaleY: options.scaleY,
              skewX: options.skewX,
              skewY: options.skewY
            });
            tempCanvas.add(item);
          });
          tempCanvas.remove(group);
          hasGroups = true;
          break;
        }
      }
    }

    const paths = tempCanvas.getObjects().filter(o => o.type === 'path' || o instanceof fabric.Path);
    if (paths.length === 0) return '';

    // Coordinate Reset: Use the Bounding Box of the designs as the ViewBox
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    paths.forEach(p => {
      const br = p.getBoundingRect();
      minX = Math.min(minX, br.left);
      minY = Math.min(minY, br.top);
      maxX = Math.max(maxX, br.left + br.width);
      maxY = Math.max(maxY, br.top + br.height);
    });

    // Add small padding
    const padding = 2;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    // Create the SVG header with the calculated viewBox and explicit inch dimensions for 96 DPI accuracy
    const widthIn = (width / 96).toFixed(4);
    const heightIn = (height / 96).toFixed(4);
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${widthIn}in" height="${heightIn}in" viewBox="${minX} ${minY} ${width} ${height}">`;
    
    // Group by color
    const colorGroups: { [key: string]: string } = {};
    paths.forEach(p => {
      const fill = (p.fill as string) || '#000000';
      if (!colorGroups[fill]) colorGroups[fill] = '';
      colorGroups[fill] += p.toSVG();
    });

    Object.entries(colorGroups).forEach(([color, content]) => {
      const colorName = color.startsWith('#') ? color.slice(1) : color;
      svgContent += `<g id="Layer_${colorName}">${content}</g>`;
    });

    svgContent += '</svg>';
    return svgContent;
  };

  const handleDownloadSelected = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      alert("Please select an object to download.");
      return;
    }

    // Isolate the Object: Create an off-screen tempCanvas exactly the size of the selected image's bounding box
    const rect = activeObject.getBoundingRect();
    const multiplier = 4; // Force 300 DPI (approx)
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.width * multiplier;
    tempCanvas.height = rect.height * multiplier;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Clean Render: Draw only that selected object onto the hidden canvas
      if (activeObject instanceof fabric.FabricImage && (activeObject as any).originalSrc) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // CORS Fix
          img.onload = () => {
            tempCtx.save();
            const scale = multiplier;
            const objCenter = activeObject.getCenterPoint();
            const relX = (objCenter.x - rect.left) * scale;
            const relY = (objCenter.y - rect.top) * scale;
            
            tempCtx.translate(relX, relY);
            tempCtx.rotate(fabric.util.degreesToRadians(activeObject.angle!));
            tempCtx.scale(activeObject.scaleX! * scale, activeObject.scaleY! * scale);
            
            if (activeObject.flipX) tempCtx.scale(-1, 1);
            if (activeObject.flipY) tempCtx.scale(1, -1);
            
            tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
            tempCtx.restore();
            resolve();
          };
          img.src = (activeObject as any).originalSrc;
        });
      } else {
        const objDataUrl = activeObject.toDataURL({
          format: 'png',
          multiplier: multiplier,
          enableRetinaScaling: true
        });
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            tempCtx.drawImage(img, 0, 0);
            resolve();
          };
          img.src = objDataUrl;
        });
      }

      const dataURL = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'my-design.png';
      link.href = dataURL;
      link.click();
    }
  };

  const handleFinalizeAndDownload = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Temporarily remove watermark
    const watermarks = canvas.getObjects().filter((o: any) => o.id === 'watermark' || o.id === 'watermark-tile');
    watermarks.forEach(wm => wm.set('visible', false));
    
    // Force-Render PNG Export
    canvas.discardActiveObject(); // Hide selection box
    canvas.renderAll();

    const dataURL = canvas.toDataURL({ 
      format: 'png', 
      multiplier: 4, 
      enableRetinaScaling: true 
    });

    const link = document.createElement('a');
    link.download = 'cricut-ready-design.png';
    link.href = dataURL;
    link.click();

    // Put the watermark back 1 second later
    setTimeout(() => {
      watermarks.forEach(wm => wm.set('visible', true));
      canvas.renderAll();
    }, 1000);
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  const handleExport = async (format: 'svg' | 'png' | 'jpeg' | 'pdf', selectionOnly = false) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (selectionOnly && !activeObject) {
      alert("Please select an object to export.");
      return;
    }

    // Temporarily hide non-design objects for clean export
    const images = canvas.getObjects().filter(o => o instanceof fabric.FabricImage);
    const watermarks = canvas.getObjects().filter((o: any) => o.id === 'watermark' || o.id === 'watermark-tile');
    const uncheckedLayers = canvas.getObjects().filter((o: any) => o.exportChecked === false);
    
    images.forEach(img => img.set('visible', false));
    watermarks.forEach(wm => wm.set('visible', false));
    uncheckedLayers.forEach(l => l.set('visible', false));

    if (format === 'svg') {
      const svgContent = await generateCricutSVG(selectionOnly);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectionOnly ? 'selection.svg' : 'crafters-design.svg';
      link.click();
    } else if (format === 'png' || format === 'jpeg') {
      let dataUrl;
      
      // Unified Layer Pointer: Identify target objects
      let targetObjects: fabric.FabricObject[] = [];
      if (selectionOnly && activeObject) {
        targetObjects = [activeObject];
      } else {
        targetObjects = canvas.getObjects().filter(o => 
          o.visible && 
          (o instanceof fabric.FabricImage || o instanceof fabric.Path || o.type === 'group' || o.type === 'path' || o.type === 'image') && 
          (o as any).id !== 'grid-group' && 
          (o as any).id !== 'watermark' &&
          (o as any).id !== 'watermark-tile' &&
          (o as any).id !== 'background_rect'
        );
      }

      if (targetObjects.length > 0) {
        // Calculate bounding box manually to avoid moving objects into a group
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        targetObjects.forEach(obj => {
          const rect = obj.getBoundingRect();
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.left + rect.width);
          maxY = Math.max(maxY, rect.top + rect.height);
        });
        const boundingBox = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
        
        // Offscreen Buffer Export: Use a Temporary Canvas method
        const tempCanvas = document.createElement('canvas');
        const multiplier = 3;
        tempCanvas.width = boundingBox.width * multiplier;
        tempCanvas.height = boundingBox.height * multiplier;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Alpha-Channel Force
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          if (format === 'jpeg') {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          }

          // Draw objects onto temp canvas
          for (const obj of targetObjects) {
            if (obj instanceof fabric.FabricImage && (obj as any).originalSrc) {
              // Rebuild high-quality image in buffer
              await new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  tempCtx.save();
                  const scale = multiplier;
                  // Fabric objects are centered by default in v6+ if originX/Y is center
                  // but getBoundingRect is always top-left.
                  // We need to account for the object's origin.
                  const objCenter = obj.getCenterPoint();
                  const relX = (objCenter.x - boundingBox.left) * scale;
                  const relY = (objCenter.y - boundingBox.top) * scale;
                  
                  tempCtx.translate(relX, relY);
                  tempCtx.rotate(fabric.util.degreesToRadians(obj.angle!));
                  tempCtx.scale(obj.scaleX! * scale, obj.scaleY! * scale);
                  
                  if (obj.flipX) tempCtx.scale(-1, 1);
                  if (obj.flipY) tempCtx.scale(1, -1);
                  
                  tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
                  tempCtx.restore();
                  resolve();
                };
                img.src = (obj as any).originalSrc;
              });
            } else {
              const objDataUrl = obj.toDataURL({
                format: 'png',
                multiplier: multiplier,
                enableRetinaScaling: true
              });
              await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                  const rect = obj.getBoundingRect();
                  tempCtx.drawImage(img, (rect.left - boundingBox.left) * multiplier, (rect.top - boundingBox.top) * multiplier);
                  resolve();
                };
                img.src = objDataUrl;
              });
            }
          }
          dataUrl = tempCanvas.toDataURL(`image/${format}`);
        }
      } else {
        dataUrl = canvas.toDataURL({ 
          format, 
          quality: 1, 
          multiplier: 3,
          enableRetinaScaling: true
        });
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = selectionOnly ? `selection.${format}` : `design.${format}`;
      link.click();

      // Restore visibility
      images.forEach(img => img.set('visible', true));
      watermarks.forEach(wm => wm.set('visible', true));
      uncheckedLayers.forEach(l => l.set('visible', true));
      canvas.renderAll();
    } else if (format === 'pdf') {
      const dataUrl = canvas.toDataURL({ format: 'png' });
      const pdf = new jsPDF({
        orientation: canvas.getWidth() > canvas.getHeight() ? 'l' : 'p',
        unit: 'px',
        format: [canvas.getWidth(), canvas.getHeight()]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.getWidth(), canvas.getHeight());
      pdf.save('design.pdf');
    }

    // Restore visibility
    images.forEach(img => img.set('visible', true));
    watermarks.forEach(wm => wm.set('visible', true));
    uncheckedLayers.forEach(l => l.set('visible', true));
    canvas.renderAll();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const swapColor = (originalHex: string, newHex: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    let changed = false;
    
    const processObject = (obj: fabric.FabricObject) => {
      if (obj instanceof fabric.Group) {
        obj.getObjects().forEach(processObject);
      } else {
        const fill = obj.fill as string;
        if (fill && fill.toLowerCase() === originalHex.toLowerCase()) {
          obj.set('fill', newHex);
          changed = true;
        }
        const stroke = obj.stroke as string;
        if (stroke && stroke.toLowerCase() === originalHex.toLowerCase()) {
          obj.set('stroke', newHex);
          changed = true;
        }
      }
    };
    
    objects.forEach(processObject);
    
    if (changed) {
      canvas.renderAll();
      saveHistory();
      setDetectedColors(prev => prev.map(c => 
        c.hex.toLowerCase() === originalHex.toLowerCase() ? { ...c, hex: newHex } : c
      ));
    }
  };
  const handleGroup = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;
    
    const group = new fabric.Group(activeObjects);
    canvas.discardActiveObject();
    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const handleKnockoutColor = (color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.FabricImage) {
      const filter = new fabric.filters.RemoveColor({
        color: color,
        distance: 0.1
      });
      active.filters.push(filter);
      active.applyFilters();
      canvas.requestRenderAll();
      saveHistory();
      alert(`Knockout color ${color} applied!`);
    } else {
      alert("Please select an image to knockout a color.");
    }
  };

  const handleDuplicate = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    const cloned = await active.clone(['id', 'isContour', 'parentId', 'name', 'selectable', 'evented', 'paintFirst', 'strokeUniform', 'exportChecked', 'fill', 'stroke', 'strokeWidth', 'scaleX', 'scaleY', 'angle']);
    cloned.set({
      left: (active.left || 0) + 20,
      top: (active.top || 0) + 20,
    });
    (cloned as any).id = Math.random().toString(36).substr(2, 9);
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    saveHistory();
    updateLayers();
  };

  const handleSlice = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length !== 2) {
      alert("Please select exactly 2 objects to slice.");
      return;
    }

    // Sort by stack order (bottom to top)
    const sorted = [...activeObjects].sort((a, b) => canvas.getObjects().indexOf(a) - canvas.getObjects().indexOf(b));
    let bottom = sorted[0];
    let top = sorted[1];

    // Auto-trace if not vectors
    const ensureVector = async (obj: fabric.FabricObject): Promise<fabric.Path | null> => {
      if (obj instanceof fabric.Path) return obj;
      if (obj instanceof fabric.FabricImage) {
        const svgString = await traceImage(obj.toDataURL(), { ...traceOptions, colors: 2 });
        const { objects } = await fabric.loadSVGFromString(svgString);
        const path = objects.find(o => o instanceof fabric.Path) as fabric.Path;
        if (path) {
          path.set({
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          });
          canvas.add(path);
          canvas.remove(obj);
          return path;
        }
      }
      return null;
    };

    const bottomVector = await ensureVector(bottom);
    const topVector = await ensureVector(top);

    if (!bottomVector || !topVector) {
      alert("Slice failed: Could not convert objects to vectors.");
      return;
    }

    try {
      const paperCanvas = document.createElement('canvas');
      paper.setup(paperCanvas);

      const getPathData = (obj: fabric.Path) => {
        return (obj as any).path.map((seg: any) => seg.join(' ')).join(' ');
      };

      const topPath = new paper.Path(getPathData(topVector));
      const bottomPath = new paper.Path(getPathData(bottomVector));

      const applyFabricTransform = (paperObj: paper.Item, fabricObj: fabric.Object) => {
        const matrix = fabricObj.calcTransformMatrix();
        paperObj.matrix = new paper.Matrix(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
      };

      applyFabricTransform(topPath, topVector);
      applyFabricTransform(bottomPath, bottomVector);

      // Boolean subtraction
      const remnantBottom = bottomPath.subtract(topPath);

      const createFabricPath = (paperItem: paper.Item, originalObj: fabric.Path) => {
        if (!paperItem || (paperItem instanceof paper.Path && !paperItem.pathData)) return null;
        if (paperItem instanceof paper.CompoundPath && !paperItem.pathData) return null;
        const pathData = (paperItem as any).pathData;
        if (!pathData) return null;

        const path = new fabric.Path(pathData, {
          fill: originalObj.fill,
          stroke: originalObj.stroke,
          strokeWidth: originalObj.strokeWidth,
          id: Math.random().toString(36).substr(2, 9),
          name: (originalObj as any).name ? `${(originalObj as any).name} (Hollow)` : 'Hollow Path',
          selectable: true,
          evented: true
        });

        // Ensure the hole maintains the same dimensions as the 'cutter' object
        // By using the bounds from paper.js which are absolute
        path.set({
          left: paperItem.bounds.left,
          top: paperItem.bounds.top,
          originX: 'left',
          originY: 'top'
        });

        return path;
      };

      const p1 = createFabricPath(remnantBottom, bottomVector);

      canvas.remove(bottomVector);
      canvas.discardActiveObject();

      if (p1) {
        canvas.add(p1);
        canvas.sendObjectToBack(p1);
      }

      canvas.setActiveObject(topVector);
      canvas.renderAll();
      saveHistory();
      updateLayers();
      alert("Slice complete! Hole punched through bottom layer.");
    } catch (error) {
      console.error("Slice failed", error);
      alert("Slice failed.");
    }
  };

  const handleBoolean = (op: 'union' | 'subtract' | 'slice') => {
    if (op === 'slice') {
      handleSlice();
      return;
    }
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) {
      alert("Please select at least 2 objects for boolean operations.");
      return;
    }
    // Placeholder for union/subtract
    handleGroup();
    alert(`${op === 'union' ? 'Weld' : 'Subtract'} applied (as group).`);
  };

  const saveProject = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const svgData = canvas.toSVG();
    
    // Include custom properties in JSON for Fabric.js v6+
    const canvasState = JSON.stringify(canvas.toJSON(['id', 'name', 'exportChecked', 'isContour', 'parentId', 'selectable', 'evented', 'paintFirst', 'strokeUniform']));
    
    const projectData = {
      svgData,
      canvasState,
      canvasSize,
      updatedAt: new Date().toISOString()
    };

    if (currentProjectId) {
      setProjects(prev => prev.map(p => 
        p.id === currentProjectId 
          ? { ...p, ...projectData }
          : p
      ));
      alert("Project updated locally!");
    } else {
      const newProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Project ${new Date().toLocaleDateString()}`,
        ...projectData,
        createdAt: new Date().toISOString()
      };

      setProjects(prev => [newProject, ...prev]);
      setCurrentProjectId(newProject.id);
      alert("Project saved locally!");
    }
  };

  const loadProject = (project: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    if (project.canvasSize) {
      setCanvasSize(project.canvasSize);
    }

    canvas.loadFromJSON(project.canvasState).then(() => {
      canvas.renderAll();
      saveHistory();
      updateLayers();
      setCurrentProjectId(project.id);
      alert(`Project "${project.name}" loaded!`);
    });
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }
    }
  };

  const renameProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const newName = prompt("Enter new project name:", project.name);
    if (newName && newName.trim()) {
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, name: newName.trim(), updatedAt: new Date().toISOString() } : p
      ));
    }
  };

  const startNewProject = () => {
    if (confirm("Start a new project? Any unsaved changes will be lost.")) {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        canvas.clear();
        canvas.backgroundColor = bgColor;
        canvas.renderAll();
        saveHistory();
        updateLayers();
      }
      setCurrentProjectId(null);
    }
  };

  // Center canvas initially and force margin: auto on Fabric container
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const fabricContainer = container.querySelector('.canvas-container');
      if (fabricContainer) {
        (fabricContainer as HTMLElement).style.margin = 'auto';
      }
    }
  }, [canvasSize]);

  useEffect(() => {
    renderGrid();
  }, [bgColor, renderGrid]);

  return (
    <div className={`h-screen w-screen flex flex-col ${theme === 'dark' ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-900'} font-sans overflow-hidden transition-colors duration-300`}>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        setApiKeys={setApiKeys}
        activeKeyId={activeKeyId}
        setActiveKeyId={setActiveKeyId}
      />

      {/* Header */}
      <header className={`h-16 border-b ${theme === 'dark' ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'} flex items-center justify-between px-6 z-50 relative shadow-sm transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Crafters Vector Pro" 
            className="h-10 w-auto object-contain crisp-image" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback if logo.png is missing
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-emerald-500 shadow-lg border border-stone-800">
                <Wand2 size={24} strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-black tracking-tighter uppercase italic">
                Crafters<span className="text-emerald-600">Vector</span>
              </h1>
              <span className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase ml-0.5">Professional Edition</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {apiKeys.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <Key size={14} className="text-stone-400" />
              <select 
                value={activeKeyId || ''} 
                onChange={(e) => setActiveKeyId(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer"
              >
                {apiKeys.map(k => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
            title="Settings"
          >
            <Settings size={20} />
          </button>

          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium"
            >
              <Download size={16} /> Export File
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 mt-2 w-64 ${theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'} border rounded-xl shadow-xl z-[60] overflow-hidden`}
                >
                  <div className={`p-3 border-b ${theme === 'dark' ? 'border-stone-800 bg-stone-950' : 'border-stone-100 bg-stone-50'}`}>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Export Formats</div>
                    <div className="grid grid-cols-1 gap-1">
                      <button onClick={() => { handleExport('svg'); setShowExportMenu(false); }} className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center gap-2 border border-transparent ${theme === 'dark' ? 'hover:bg-stone-800 hover:border-stone-700' : 'hover:bg-white hover:border-stone-200'}`}>
                        <ImageIcon size={14} className="text-emerald-600" /> SVG (Cricut/Vector)
                      </button>
                      <button onClick={() => { handleExport('png'); setShowExportMenu(false); }} className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center gap-2 border border-transparent ${theme === 'dark' ? 'hover:bg-stone-800 hover:border-stone-700' : 'hover:bg-white hover:border-stone-200'}`}>
                        <ImageIcon size={14} className="text-blue-600" /> PNG (High Res)
                      </button>
                      <button onClick={() => { handleDownloadSelected(); setShowExportMenu(false); }} className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center gap-2 border border-transparent ${theme === 'dark' ? 'hover:bg-stone-800 hover:border-stone-700' : 'hover:bg-white hover:border-stone-200'}`}>
                        <Download size={14} className="text-orange-600" /> Download Selected
                      </button>
                      <button onClick={() => { handleFinalizeAndDownload(); setShowExportMenu(false); }} className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex items-center gap-2 border border-transparent ${theme === 'dark' ? 'hover:bg-stone-800 hover:border-stone-700' : 'hover:bg-white hover:border-stone-200'}`}>
                        <CheckCircle size={14} className="text-emerald-600" /> Finalize & Download PNG
                      </button>
                    </div>
                  </div>

                  {layers.length > 0 && (
                    <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Layers</span>
                        <button 
                          onClick={() => {
                            const canvas = fabricCanvasRef.current;
                            if (canvas) {
                              const allChecked = layers.every(l => l.exportChecked);
                              canvas.getObjects().forEach((o: any) => {
                                if (o.type !== 'image' && o.id !== 'grid-group' && o.id !== 'background_rect') {
                                  o.exportChecked = !allChecked;
                                }
                              });
                              updateLayers();
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          {layers.every(l => l.exportChecked) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {layers.map((layer) => (
                          <div 
                            key={layer.id} 
                            className="flex items-center gap-2 p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() => toggleLayerExport(layer.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={layer.exportChecked} 
                              onChange={() => {}} // Handled by div onClick
                              className="w-3 h-3 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div 
                              className="w-3 h-3 rounded-full border border-stone-200 shrink-0" 
                              style={{ backgroundColor: layer.fill }}
                            />
                            <span className="text-[11px] font-medium text-stone-600 truncate">{layer.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={startNewProject}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
              title="New Project"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={saveProject}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Save size={16} /> {currentProjectId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Precision Property Bar */}
      {selectionDimensions && selectionDimensions.visible && (
        <div className={`h-12 border-b ${theme === 'dark' ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'} flex items-center px-6 gap-6 z-40 transition-colors duration-300`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Width</span>
            <div className="relative">
              <input
                type="text"
                value={propertyBarValues.w}
                onChange={(e) => handlePropertyChange('w', e.target.value)}
                className={`w-20 h-8 px-2 text-xs font-mono rounded border ${theme === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'} focus:outline-none focus:border-emerald-500 transition-colors`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 font-bold">in</span>
            </div>
          </div>

          <button
            onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
            className={`p-1.5 rounded-lg transition-all ${isAspectRatioLocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-stone-100 text-stone-400 dark:bg-stone-800'}`}
            title={isAspectRatioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
          >
            {isAspectRatioLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Height</span>
            <div className="relative">
              <input
                type="text"
                value={propertyBarValues.h}
                onChange={(e) => handlePropertyChange('h', e.target.value)}
                className={`w-20 h-8 px-2 text-xs font-mono rounded border ${theme === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'} focus:outline-none focus:border-emerald-500 transition-colors`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 font-bold">in</span>
            </div>
          </div>

          {/* Color Picker for Shapes */}
          {(activeObjectType === 'rect' || activeObjectType === 'circle' || activeObjectType === 'polygon') && (
            <div className="flex items-center gap-4 pl-4 border-l border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Fill</span>
                <div className="flex items-center gap-1">
                  <div className="relative w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm group">
                    <input
                      type="color"
                      value={(activeObjectColor === 'transparent' || activeObjectColor === 'rgba(0,0,0,0)') ? '#ffffff' : activeObjectColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                    />
                    <div 
                      className={`w-full h-full transition-transform group-hover:scale-110 ${(activeObjectColor === 'transparent' || activeObjectColor === 'rgba(0,0,0,0)') ? 'bg-white' : ''}`} 
                      style={{ backgroundColor: (activeObjectColor === 'transparent' || activeObjectColor === 'rgba(0,0,0,0)') ? undefined : activeObjectColor }}
                    >
                      {(activeObjectColor === 'transparent' || activeObjectColor === 'rgba(0,0,0,0)') && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleColorChange('transparent')}
                    className={`p-1.5 rounded-lg transition-all ${(activeObjectColor === 'transparent' || activeObjectColor === 'rgba(0,0,0,0)') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-stone-100 text-stone-400 dark:bg-stone-800'}`}
                    title="No Fill"
                  >
                    <Eraser size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Border</span>
                <div className="relative w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm group">
                  <input
                    type="color"
                    value={activeObjectStrokeColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                  />
                  <div 
                    className="w-full h-full transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: activeObjectStrokeColor }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mirror/Flip Tools */}
          <div className="flex items-center gap-1 pl-4 border-l border-stone-200 dark:border-stone-800">
            <button
              onClick={handleFlipHorizontal}
              className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-all`}
              title="Flip Horizontal"
            >
              <FlipHorizontal size={16} />
            </button>
            <button
              onClick={handleFlipVertical}
              className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-all`}
              title="Flip Vertical"
            >
              <FlipVertical size={16} />
            </button>
          </div>

          {/* Knockout Button for Shapes */}
          {(activeObjectType === 'rect' || activeObjectType === 'circle' || activeObjectType === 'polygon') && (
            <button
              onClick={handleKnockout}
              className="ml-auto px-4 py-1.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-sm border border-white/10"
            >
              Knockout
            </button>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Controls */}
        <motion.aside 
          initial={false}
          animate={{ width: sidebarOpen ? 320 : 0 }}
          className={`w-80 border-r ${theme === 'dark' ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'} flex flex-col z-40 overflow-hidden shrink-0 relative transition-colors duration-300`}
        >
          <div className="w-80 flex flex-col h-full">
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-stone-800' : 'border-stone-100'} flex gap-2`}>
              {(['generate', 'trace', 'edit', 'canvas'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === tab 
                    ? (theme === 'dark' ? 'bg-stone-100 text-stone-900 shadow-md' : 'bg-stone-900 text-white shadow-md')
                    : (theme === 'dark' ? 'text-stone-500 hover:bg-stone-800' : 'text-stone-400 hover:bg-stone-50')
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Mat Size Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mat Size</label>
                <select 
                  value={matSize}
                  onChange={(e) => setMatSize(e.target.value as any)}
                  className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'} border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                >
                  <option value="12x12">12x12 (Standard)</option>
                  <option value="12x24">12x24 (Large)</option>
                  <option value="A4">A4 (Sublimation)</option>
                </select>
              </div>
              {activeTab === 'generate' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">AI Prompt</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your design (e.g., 'A cute floral mandala for Cricut')"
                      className={`w-full h-32 p-3 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'} border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm`}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} rounded-xl border transition-all ${isLineArtMode ? 'ring-2 ring-emerald-500' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Scissors size={16} className="text-emerald-600" />
                      <span className="text-xs font-bold text-stone-600">Cricut Optimization</span>
                    </div>
                    <button 
                      onClick={() => setIsLineArtMode(!isLineArtMode)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isLineArtMode ? 'bg-emerald-600' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isLineArtMode ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {isLineArtMode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100"
                    >
                      <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Limited Palette</label>
                      <div className="flex items-center gap-4">
                        <select 
                          value={numPaletteColors}
                          onChange={(e) => setNumPaletteColors(parseInt(e.target.value))}
                          className="bg-white border border-emerald-200 rounded-lg p-1 text-xs outline-none"
                        >
                          {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Colors</option>)}
                        </select>
                        <div className="flex gap-2">
                          {paletteColors.slice(0, numPaletteColors).map((color, i) => (
                            <input 
                              key={i}
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...paletteColors];
                                newColors[i] = e.target.value;
                                setPaletteColors(newColors);
                              }}
                              className="w-6 h-6 rounded-full border-none p-0 cursor-pointer overflow-hidden"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt || !activeKey}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {isGenerating ? 'Generating...' : <><Wand2 size={20} /> Create Design</>}
                  </button>
                  {!activeKey && (
                    <p className="text-[10px] text-center text-amber-600 font-medium mt-2">
                      Please add a Gemini API key in Settings to start generating.
                    </p>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className={`w-full border-t ${theme === 'dark' ? 'border-stone-800' : 'border-stone-100'}`}></span></div>
                    <div className={`relative flex justify-center text-xs uppercase tracking-widest text-stone-400 ${theme === 'dark' ? 'bg-stone-900' : 'bg-white'} px-2`}>or upload</div>
                  </div>
                  <label className={`w-full py-4 border-2 border-dashed ${theme === 'dark' ? 'border-stone-800 hover:bg-stone-800/50' : 'border-stone-200 hover:bg-emerald-50/50'} rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 transition-all group`}>
                    <Upload size={24} className="text-stone-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-medium text-stone-500 group-hover:text-emerald-700">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  </label>
                </div>
              )}

              {activeTab === 'trace' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Color Palette</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setDetectedColors(prev => prev.map(c => ({ ...c, selected: true })))}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-tighter"
                        >
                          Select All
                        </button>
                        <span className="text-stone-300">|</span>
                        <button 
                          onClick={() => setDetectedColors(prev => prev.map(c => ({ ...c, selected: false })))}
                          className="text-[10px] font-bold text-stone-400 hover:text-stone-500 uppercase tracking-tighter"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={() => {
                            setIsEyedropperActive(!isEyedropperActive);
                            const canvas = fabricCanvasRef.current;
                            if (canvas) canvas.defaultCursor = !isEyedropperActive ? 'crosshair' : 'default';
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${isEyedropperActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200'}`}
                          title="Eyedropper Tool"
                        >
                          <Palette size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {detectedColors.map((color, i) => (
                        <div key={i} className="relative group">
                          <button
                            onClick={() => {
                              setDetectedColors(prev => prev.map((c, idx) => idx === i ? { ...c, selected: !c.selected } : c));
                            }}
                            className={`w-full aspect-square rounded-lg border-2 transition-all ${color.selected ? 'border-emerald-500 scale-105' : 'border-transparent opacity-40'}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.hex}
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwappingColor({ original: color.hex, current: color.hex });
                            }}
                            className="absolute -top-1 -right-1 bg-white shadow-md rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Palette size={10} className="text-emerald-600" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {swappingColor && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: swappingColor.original }} />
                          <span className="text-[10px] font-bold text-emerald-700">Swap to:</span>
                          <input 
                            type="color" 
                            value={swappingColor.current}
                            onChange={(e) => setSwappingColor({ ...swappingColor, current: e.target.value })}
                            className="w-6 h-6 rounded-full border-none p-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              swapColor(swappingColor.original, swappingColor.current);
                              setSwappingColor(null);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                          >
                            Apply
                          </button>
                          <button 
                            onClick={() => setSwappingColor(null)}
                            className="px-2 py-1 bg-stone-200 text-stone-600 text-[10px] font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-stone-400 italic">Select colors to include in the vector trace.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Color Tolerance</label>
                      <span className="text-sm font-mono font-bold text-emerald-600">{colorTolerance}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={colorTolerance}
                      onChange={(e) => setColorTolerance(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <p className="text-[10px] text-stone-400 italic">Higher tolerance merges similar shades into flat colors.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Smoothness</label>
                      <span className="text-sm font-mono font-bold text-emerald-600">{traceOptions.blur}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="0.5"
                      value={traceOptions.blur}
                      onChange={(e) => setTraceOptions({...traceOptions, blur: parseFloat(e.target.value)})}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Max Colors</label>
                      <span className="text-sm font-mono font-bold text-emerald-600">{traceOptions.colors}</span>
                    </div>
                    <input 
                      type="range" min="2" max="16" 
                      value={traceOptions.colors}
                      onChange={(e) => setTraceOptions({...traceOptions, colors: parseInt(e.target.value)})}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <button 
                    onClick={() => sourceImage && applyTrace(sourceImage)}
                    disabled={!sourceImage || isTracing}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isTracing ? 'Tracing...' : <><ImageIcon size={20} /> Start Vector Trace</>}
                  </button>
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Image Tools</label>
                    <button 
                      onClick={removeBackground}
                      disabled={isTracing}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all text-sm font-bold disabled:opacity-50"
                    >
                      <Eraser size={18} /> {isTracing ? 'Processing...' : 'AI Remove Background'}
                    </button>
                    <button 
                      onClick={vacuumTinyBits}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all text-sm font-bold"
                    >
                      <Zap size={18} /> Vacuum Tiny Bits
                    </button>

                    <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Knockout Color</label>
                        <input 
                          type="color" 
                          value={knockoutColorValue}
                          onChange={(e) => setKnockoutColorValue(e.target.value)}
                          className="w-6 h-6 rounded-full border-none p-0 cursor-pointer"
                        />
                      </div>
                      <button 
                        onClick={() => handleKnockoutColor(knockoutColorValue)}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-100 transition-all text-xs font-bold"
                      >
                        <Pipette size={14} /> Knockout Selected Color
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Add Elements</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => addShape('rect')} className="flex flex-col items-center gap-1 p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-bold">
                        <Square size={16} /> Rect
                      </button>
                      <button onClick={() => addShape('circle')} className="flex flex-col items-center gap-1 p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-bold">
                        <CircleIcon size={16} /> Circle
                      </button>
                      <button onClick={() => addShape('star')} className="flex flex-col items-center gap-1 p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-bold">
                        <Star size={16} /> Star
                      </button>
                      <button onClick={addText} className="flex flex-col items-center gap-1 p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-bold">
                        <Type size={16} /> Text
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <select 
                        value={textSettings.font}
                        onChange={(e) => setTextSettings({...textSettings, font: e.target.value})}
                        className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Courier New">Courier</option>
                        <option value="Times New Roman">Times</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                      <input 
                        type="color" 
                        value={textSettings.color}
                        onChange={(e) => setTextSettings({...textSettings, color: e.target.value})}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Contour Width</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={contourColor}
                          onChange={(e) => {
                            setContourColor(e.target.value);
                            if (contourWidth > 0) applyContour(contourWidth);
                          }}
                          className="w-6 h-6 rounded-full border-none p-0 cursor-pointer"
                          title="Contour Color"
                        />
                        <span className="text-sm font-mono font-bold text-emerald-600">{contourWidth}px</span>
                      </div>
                    </div>
                    <input 
                      type="range" min="0" max="20" 
                      value={contourWidth}
                      onChange={(e) => applyContour(parseInt(e.target.value))}
                      onMouseUp={() => saveHistory()}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Transform</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleFlip('h')}
                        className={`flex flex-col items-center justify-center gap-1 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-[10px] font-bold`}
                      >
                        <FlipHorizontal size={16} /> Flip H
                      </button>
                      <button 
                        onClick={() => handleFlip('v')}
                        className={`flex flex-col items-center justify-center gap-1 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-[10px] font-bold`}
                      >
                        <FlipVertical size={16} /> Flip V
                      </button>
                      <button 
                        onClick={handleCenter}
                        className={`flex flex-col items-center justify-center gap-1 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-[10px] font-bold`}
                      >
                        <Maximize2 size={16} /> Center
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Layer Actions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleDuplicate} className={`flex items-center gap-2 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-xs font-bold`}>
                        <Copy size={14} /> Duplicate
                      </button>
                      <button onClick={handleUngroup} className={`flex items-center gap-2 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-xs font-bold`}>
                        <Ungroup size={14} /> Ungroup
                      </button>
                      <button onClick={() => handleReorder('front')} className={`flex items-center gap-2 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-xs font-bold`}>
                        <ArrowUp size={14} /> To Front
                      </button>
                      <button onClick={() => handleReorder('back')} className={`flex items-center gap-2 p-2 ${theme === 'dark' ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'} border rounded-xl transition-all text-xs font-bold`}>
                        <ArrowDown size={14} /> To Back
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Boolean Ops</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleBoolean('union')} className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-sm font-medium">
                        <Combine size={16} /> Weld
                      </button>
                      <button onClick={() => handleBoolean('subtract')} className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-all text-sm font-medium">
                        <Scissors size={16} /> Slice
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sublimation Tools</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <Type size={16} className="text-stone-400" />
                        <input 
                          type="text" 
                          placeholder="Add Watermark..."
                          value={watermark}
                          onChange={(e) => setWatermark(e.target.value)}
                          className="bg-transparent outline-none text-sm w-full"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <span className="text-sm font-medium">Tile Watermark</span>
                        <button 
                          onClick={() => setTileWatermark(!tileWatermark)}
                          className={`w-10 h-5 rounded-full transition-all relative ${tileWatermark ? 'bg-emerald-600' : 'bg-stone-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tileWatermark ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <Palette size={16} className="text-stone-400" />
                        <input 
                          type="color" 
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <span className="text-sm font-medium">Background</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Canvas Settings</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <span className="text-sm font-medium">Show 12x12 Grid</span>
                        <button 
                          onClick={() => setShowGrid(!showGrid)}
                          className={`w-10 h-5 rounded-full transition-all relative ${showGrid ? 'bg-emerald-600' : 'bg-stone-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showGrid ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lock Aspect</span>
                        <button onClick={() => setAspectLocked(!aspectLocked)} className="text-stone-500">
                          {aspectLocked ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-center">
                          <div className="text-[10px] text-stone-400 uppercase font-bold">Width (px)</div>
                          <input 
                            type="number" 
                            value={canvasSize.width} 
                            onChange={(e) => updateCanvasWidth(parseInt(e.target.value) || 0)}
                            className="text-sm font-bold bg-transparent w-full text-center outline-none"
                          />
                        </div>
                        <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-center">
                          <div className="text-[10px] text-stone-400 uppercase font-bold">Height (px)</div>
                          <input 
                            type="number" 
                            value={canvasSize.height} 
                            onChange={(e) => updateCanvasHeight(parseInt(e.target.value) || 0)}
                            className="text-sm font-bold bg-transparent w-full text-center outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {layers.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-stone-100">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Layers</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {layers.map((layer) => (
                          <div key={layer.id} className="space-y-2">
                            <div 
                              onClick={() => selectLayer(layer.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                selectedLayerId === layer.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 bg-stone-50 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div 
                                  className="w-4 h-4 rounded-full border border-stone-200 shrink-0" 
                                  style={{ backgroundColor: layer.fill }}
                                />
                                <span className="text-xs font-medium truncate">{layer.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                  className={`p-1 rounded hover:bg-white transition-colors ${layer.visible ? 'text-stone-600' : 'text-stone-300'}`}
                                >
                                  {layer.visible ? <ImageIcon size={14} /> : <ImageIcon size={14} className="opacity-30" />}
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                  className="p-1 rounded hover:bg-white text-stone-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {selectedLayerId === layer.id && (
                              <div className="flex items-center gap-2 px-2 pb-2 animate-in fade-in slide-in-from-top-1">
                                <input 
                                  type="color" 
                                  value={layer.fill} 
                                  onChange={(e) => updateLayerColor(layer.id, e.target.value)}
                                  className="w-6 h-6 rounded cursor-pointer border-none p-0 overflow-hidden"
                                />
                                <span className="text-[10px] font-mono text-stone-500">{layer.fill.toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'canvas' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Canvas Size</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] text-stone-400 uppercase">Width</span>
                        <input 
                          type="number" value={canvasSize.width} 
                          onChange={(e) => setCanvasSize({...canvasSize, width: parseInt(e.target.value)})}
                          className="w-full p-2 text-sm border border-stone-200 rounded-lg bg-stone-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-stone-400 uppercase">Height</span>
                        <input 
                          type="number" value={canvasSize.height} 
                          onChange={(e) => setCanvasSize({...canvasSize, height: parseInt(e.target.value)})}
                          className="w-full p-2 text-sm border border-stone-200 rounded-lg bg-stone-50"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setAspectLocked(!aspectLocked)}
                      className="flex items-center gap-2 text-xs text-stone-500 hover:text-emerald-600 transition-all"
                    >
                      {aspectLocked ? <Lock size={14} /> : <Unlock size={14} />}
                      {aspectLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Background Color</label>
                    <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <input 
                        type="color" value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                      />
                      <span className="text-sm font-mono font-bold text-stone-600">{bgColor.toUpperCase()}</span>
                    </div>
                  </div>

                  {projects.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-stone-100">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">My Projects ({projects.length})</label>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {projects.map((project) => (
                          <div 
                            key={project.id} 
                            className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                              currentProjectId === project.id 
                                ? 'border-emerald-500 bg-emerald-50/50' 
                                : (theme === 'dark' ? 'bg-stone-800/50 border-stone-700 hover:border-emerald-500' : 'bg-stone-50 border-stone-200 hover:border-emerald-500')
                            }`}
                            onClick={() => loadProject(project)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold truncate pr-2">{project.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); renameProject(project.id); }}
                                  className="p-1 text-stone-400 hover:text-emerald-500 transition-all"
                                  title="Rename"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                  className="p-1 text-stone-400 hover:text-red-500 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
                              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Save size={10} /> Local</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-white border border-stone-200 border-l-0 rounded-r-lg flex items-center justify-center text-stone-400 hover:text-emerald-600 transition-all shadow-md ${sidebarOpen ? 'translate-x-80' : 'translate-x-0'}`}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Main Canvas Area */}
        <main className={`flex-1 flex flex-col relative ${theme === 'dark' ? 'bg-stone-950' : 'bg-stone-100/50'} transition-colors duration-300 overflow-hidden`}>
          {/* Canvas Toolbar */}
          <div className={`h-12 border-b ${theme === 'dark' ? 'border-stone-800 bg-stone-900/80' : 'border-stone-200 bg-white/80'} backdrop-blur-md flex items-center justify-center gap-4 px-4 transition-colors duration-300 z-50`}>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className={`p-2 rounded-lg transition-all disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded-lg transition-all disabled:opacity-30 ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className={`w-px h-6 ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-200'} mx-2`}></div>
            <button onClick={handleZoomOut} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}><Minus size={18} /></button>
            <input 
              type="range" 
              min="10" 
              max="500" 
              value={zoomLevel * 100} 
              onChange={(e) => handleZoom(parseInt(e.target.value))}
              className="w-32 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-xs font-mono font-bold text-stone-400 w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
            <button onClick={handleZoomIn} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}><Plus size={18} /></button>
            <div className={`w-px h-6 ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-200'} mx-2`}></div>
            <button 
              onClick={resetView}
              className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
              title="Reset View (Center Mat & 100% Zoom)"
            >
              <Target size={18} />
            </button>
            <div className={`w-px h-6 ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-200'} mx-2`}></div>
            <button 
              onClick={resetCanvas}
              className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-red-900/20 text-stone-500 hover:text-red-500' : 'hover:bg-red-50 text-stone-400 hover:text-red-600'}`}
              title="Reset Canvas"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={() => {
              const canvas = fabricCanvasRef.current;
              if (canvas) {
                canvas.clear();
                canvas.backgroundColor = bgColor;
                canvas.renderAll();
                saveHistory();
              }
            }} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-red-900/20 text-stone-500 hover:text-red-500' : 'hover:bg-red-50 text-stone-400 hover:text-red-600'}`} title="Clear Canvas"><RotateCcw size={18} /></button>
            <button onClick={() => {
              const canvas = fabricCanvasRef.current;
              const active = canvas?.getActiveObject();
              if (active) {
                canvas?.remove(active);
                canvas?.renderAll();
              }
            }} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-red-900/20 text-stone-500 hover:text-red-500' : 'hover:bg-red-50 text-stone-400 hover:text-red-600'}`}><Trash2 size={18} /></button>
            <button onClick={() => {
              const canvas = fabricCanvasRef.current;
              const active = canvas?.getActiveObject();
              if (active) {
                canvas?.centerObject(active);
                canvas?.renderAll();
              }
            }} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}><Maximize2 size={18} /></button>
          </div>

          <div 
            ref={containerRef} 
            className={`flex-1 relative overflow-hidden ${theme === 'dark' ? 'bg-stone-950' : 'bg-[#f0f0f0]'} transition-colors duration-300`}
          >
            {/* Workspace-Wrapper */}
            <div className="absolute inset-0 Workspace-Wrapper">
              {/* The Mat background with grid */}
              <div 
                ref={matRef}
                className={`absolute shadow-2xl border-4 ${theme === 'dark' ? 'border-stone-800' : 'border-emerald-500'} pointer-events-none transition-all duration-300`}
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  transform: `translate(${viewportTransform[4]}px, ${viewportTransform[5]}px) scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  backgroundColor: theme === 'dark' ? '#1c1917' : '#ffffff',
                  backgroundImage: showGrid ? `
                    linear-gradient(to right, ${theme === 'dark' ? '#374151' : '#ccc'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${theme === 'dark' ? '#374151' : '#ccc'} 1px, transparent 1px)
                  ` : 'none',
                  backgroundSize: `${96}px ${96}px`, // 1 inch grid
                }}
              >
                {/* Static 0,0 Marker */}
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white z-10">
                  0
                </div>
              </div>
              
              <canvas ref={canvasRef} className="absolute inset-0" />
              
              {/* Selection Dimensions Label */}
              <SelectionDimensions 
                dimensions={selectionDimensions}
                zoom={zoomLevel}
                viewportTransform={viewportTransform}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
