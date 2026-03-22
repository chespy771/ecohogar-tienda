import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Zap, DollarSign, AlertTriangle, CheckCircle2, Lightbulb, Home, 
  Settings, PieChart, Calendar, ArrowRight, Power, Thermometer, 
  Droplets, Wind, Info, TrendingDown, CreditCard, Check, BarChart as BarChartIcon,
  Lock, Sun, BatteryCharging, Activity, PhoneCall, ShieldCheck, Crown,
  Moon, ThermometerSun, Plug, ThermometerSnowflake, Flame,
  Trophy, Star, Target, Medal, Gamepad2, Award, LightbulbOff,
  CloudSun, Battery, Car, ShoppingCart, Store, Tag, PlusCircle, HelpCircle, ChevronDown, ChevronUp, Camera,
  Globe, Landmark, Smartphone, Download
} from 'lucide-react';

// --- Initial Data ---
const initialDevices = [
  { id: 1, name: 'Aire Acondicionado', iconName: 'Wind', powerW: 1500, hoursPerDay: 5 },
  { id: 2, name: 'Refrigerador', iconName: 'Thermometer', powerW: 250, hoursPerDay: 24 },
  { id: 3, name: 'Calentador de Agua', iconName: 'Droplets', powerW: 2000, hoursPerDay: 2 },
  { id: 4, name: 'TV y Consolas', iconName: 'Power', powerW: 200, hoursPerDay: 4 },
  { id: 5, name: 'Iluminación LED', iconName: 'Lightbulb', powerW: 100, hoursPerDay: 6 },
];

const iconMap: Record<string, any> = {
  Wind, Thermometer, Droplets, Power, Lightbulb, Zap
};

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [myDevices, setMyDevices] = useState<any[]>([]);
  const [newDevice, setNewDevice] = useState({ name: '', powerW: '', hoursPerDay: '' });
  const [currentPlan, setCurrentPlan] = useState('Básico');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [realTimePower, setRealTimePower] = useState(1.24); // kW
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Gamification State
  const [points, setPoints] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);

  // FETCH REAL DATA ON MOUNT
  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (data && data.points !== undefined) {
          setPoints(data.points);
          setCurrentPlan(data.plan || 'Básico');
        }
      })
      .catch(e => console.error("Error fetching user:", e));

    fetch('/api/devices')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setMyDevices(data);
        } else if (data && data.length === 0) {
          // Fallback just in case
          setMyDevices(initialDevices);
        }
      })
      .catch(e => console.error("Error fetching devices:", e));
  }, []);

  
  // Tienda State
  const [tiendaMode, setTiendaMode] = useState<'comprar' | 'vender'>('comprar');
  const [sellerView, setSellerView] = useState<'dashboard' | 'publish' | 'sales' | 'payments'>('dashboard');
  const [buyerView, setBuyerView] = useState<'catalog' | 'purchases'>('catalog');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<any>(null);
  
  const [showPlanPaymentModal, setShowPlanPaymentModal] = useState(false);
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<any>(null);
  
  const [sellerPaymentMethods, setSellerPaymentMethods] = useState({
    stripe: { enabled: true, accountId: '' },
    paypal: { enabled: false, email: '' },
    bancolombia: { enabled: false, accountType: 'Ahorros', accountNumber: '' },
    nequi: { enabled: false, phone: '' }
  });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const [catalogProducts, setCatalogProducts] = useState([
    {
      id: 1,
      title: 'Kit Paneles Solares 5kW',
      desc: 'Sistema completo con inversor híbrido. Ideal para hogares medianos.',
      price: 4500.00,
      stock: 5,
      sellerStripeAccountId: 'acct_1MockSeller123',
      icon: Sun,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400&h=300'
    },
    {
      id: 2,
      title: 'Batería Doméstica 10kWh',
      desc: 'Almacena tu energía solar o carga en horas valle para usar en horas pico.',
      price: 3200.00,
      stock: 2,
      sellerStripeAccountId: 'acct_2MockSeller456',
      icon: Battery,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400&h=300'
    },
    {
      id: 3,
      title: 'Pack 4 Enchufes Inteligentes',
      desc: 'Controla y mide el consumo de cualquier electrodoméstico desde la app.',
      price: 49.99,
      stock: 15,
      sellerStripeAccountId: 'acct_1MockSeller123',
      icon: Plug,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400&h=300'
    },
    {
      id: 4,
      title: 'Sensor de Energía Principal',
      desc: 'Se instala en tu cuadro eléctrico para medir el consumo total en tiempo real.',
      price: 129.00,
      stock: 8,
      sellerStripeAccountId: 'acct_3MockSeller789',
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=400&h=300'
    }
  ]);

  const [newProductForm, setNewProductForm] = useState({
    title: '', price: '', category: 'Paneles Solares', desc: '', stock: ''
  });

  const [purchases, setPurchases] = useState([
    { id: 'p1', title: 'Sensor de Energía Principal', date: '10 Ene 2026', daysAgo: 63, price: '$129.00', status: 'En camino', seller: 'EcoTech Solutions' },
    { id: 'p2', title: 'Pack 4 Enchufes Inteligentes', date: '10 Mar 2026', daysAgo: 4, price: '$49.99', status: 'En camino', seller: 'SmartHome Inc' }
  ]);

  const [sellerOrders, setSellerOrders] = useState([
    { id: 'so1', product: 'Kit Paneles Solares 5kW', date: '14 Mar 2026', price: '$4,500.00', status: 'Completado', proofUrl: null },
    { id: 'so2', product: 'Batería Doméstica 10kWh', date: '10 Mar 2026', price: '$3,200.00', status: 'En proceso', proofUrl: null },
    { id: 'so3', product: 'Sensor de Energía Principal', date: '08 Mar 2026', price: '$129.00', status: 'En proceso', proofUrl: null }
  ]);

  const handleRefund = (id: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'Reembolsado' } : p));
    setToast({ message: 'Reporte recibido. El dinero ha sido devuelto a tu cuenta y descontado al vendedor.', type: 'success' });
  };

  const handleUploadProof = (id: string) => {
    setSellerOrders(prev => prev.map(o => o.id === id ? { ...o, proofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400&h=300' } : o));
    setToast({ message: 'Foto de prueba subida exitosamente. Solo el dueño puede verla.', type: 'success' });
  };

  const handleUploadProofBuyer = (id: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'Verificando Pago' } : p));
    setSellerOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Pago Subido', proofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400&h=300' } : o));
    setToast({ message: 'Comprobante subido exitosamente. El vendedor verificará el pago.', type: 'success' });
  };

  const handleVerifyPayment = (id: string) => {
    setSellerOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'En proceso', proofUrl: null } : o));
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'En camino' } : p));
    setToast({ message: 'Pago verificado. El pedido ahora está en proceso.', type: 'success' });
  };

  const initiateBuy = (product: any) => {
    if (product.stock <= 0) {
      setToast({ message: 'Este producto está agotado.', type: 'error' });
      return;
    }
    setSelectedProductForBuy(product);
    setShowPaymentModal(true);
  };

  const confirmBuy = async (method: string) => {
    const product = selectedProductForBuy;
    if (!product) return;
    
    setShowPaymentModal(false);

    if (method === 'stripe') {
      try {
        setToast({ message: 'Conectando con pasarela de pago...', type: 'info' });
        
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            product,
            appUrl: window.location.origin
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al procesar el pago');
        }

        if (data.demo) {
          setToast({ message: 'Modo Demo: Simulando pago exitoso (Stripe no configurado)...', type: 'info' });
          setTimeout(() => {
            window.location.href = data.url;
          }, 1500);
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error: any) {
        if (error.message.includes('must start with')) {
          setToast({ message: 'La clave de Stripe es inválida. Debe empezar con sk_test_ o sk_live_. Revisa tus variables de entorno.', type: 'error' });
        } else if (error.message.includes('STRIPE_SECRET_KEY')) {
          setToast({ message: 'Falta configurar las claves de Stripe en las variables de entorno.', type: 'error' });
        } else {
          setToast({ message: 'Error al iniciar el pago: ' + error.message, type: 'error' });
        }
      }
    } else if (method === 'mercadopago') {
      try {
        setToast({ message: 'Conectando con MercadoPago... 💳', type: 'info' });
        
        const response = await fetch('/api/create-mercadopago-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            product,
            appUrl: window.location.origin,
            sellerMpAccountId: 'VENDEDOR_MP_MOCK_123'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al procesar con MercadoPago');
        }

        if (data.demo) {
          setToast({ message: 'Modo MP Demo: Redirigiendo a compra exitosa...', type: 'info' });
          setTimeout(() => {
            window.location.href = data.url;
          }, 1500);
          return;
        }

        window.location.href = data.url;
      } catch (error: any) {
        setToast({ message: 'Error con MercadoPago: ' + error.message, type: 'error' });
      }
    } else {
      // Manual payment methods (PayPal)
      setCatalogProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
      const newPurchase = {
        id: `p${Date.now()}`,
        title: product.title,
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        daysAgo: 0,
        price: `$${product.price.toFixed(2)}`,
        status: 'Pendiente de Pago',
        seller: 'Vendedor Local'
      };
      setPurchases(prev => [newPurchase, ...prev]);
      
      const newSellerOrder = {
        id: newPurchase.id,
        product: product.title,
        date: newPurchase.date,
        price: newPurchase.price,
        status: 'Pendiente de Pago',
        proofUrl: null
      };
      setSellerOrders(prev => [newSellerOrder, ...prev]);
      
      setToast({ message: `Pedido creado. Por favor realiza el pago vía ${method.toUpperCase()} y sube el comprobante.`, type: 'success' });
      setBuyerView('purchases');
    }
  };
  
  const currentLevel = Math.floor(points / 100) + 1;
  const pointsToNextLevel = 100 - (points % 100);
  const progressPercentage = (points % 100);

  const dailyChallenges = [
    { id: 1, title: 'Apagar luces innecesarias', desc: 'Apaga las luces de habitaciones vacías por 4 horas.', points: 20, icon: LightbulbOff, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 2, title: 'Desconectar cargadores', desc: 'Desconecta 3 cargadores que no estés usando.', points: 15, icon: Plug, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 3, title: 'Modo Eco en AC', desc: 'Usa el Aire Acondicionado a 24°C o más.', points: 30, icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  ];

  const badges = [
    { id: 1, title: 'Novato Ecológico', desc: 'Alcanza el Nivel 2', reqLevel: 2, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 2, title: 'Cazador de Vampiros', desc: 'Desconecta 10 cargadores', reqLevel: 3, icon: Plug, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 3, title: 'Maestro del Clima', desc: 'Alcanza el Nivel 5', reqLevel: 5, icon: ThermometerSnowflake, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    { id: 4, title: 'Guardián de la Luz', desc: 'Alcanza el Nivel 10', reqLevel: 10, icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 5, title: 'Héroe del Planeta', desc: 'Alcanza el Nivel 20', reqLevel: 20, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  const rewards = [
    { id: 1, title: '1 Mes Gratis Plan Eco', desc: 'Prueba todas las funciones de IA.', cost: 1500, icon: Crown, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 2, title: 'Cupón 15% Enchufe Inteligente', desc: 'Descuento en nuestra tienda asociada.', cost: 1000, icon: Plug, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 3, title: 'Asesoría Solar VIP (30 min)', desc: 'Habla con un ingeniero experto.', cost: 25000, icon: Sun, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  const completeChallenge = async (id: number, reward: number) => {
    if (!completedChallenges.includes(id)) {
      setCompletedChallenges([...completedChallenges, id]);
      setPoints(prev => prev + reward);
      setToast({ message: `¡Reto completado! Ganaste ${reward} puntos 🌟`, type: 'success' });
      setTimeout(() => setToast(null), 3000);

      try {
        await fetch('/api/user/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: reward })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const redeemReward = async (id: number, cost: number, title: string) => {
    if (points >= cost && !redeemedRewards.includes(id)) {
      setPoints(prev => prev - cost);
      setRedeemedRewards([...redeemedRewards, id]);
      setToast({ message: `¡Felicidades! Has canjeado: ${title} 🎉`, type: 'success' });
      setTimeout(() => setToast(null), 4000);

      try {
        await fetch('/api/user/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: -cost })
        });
      } catch (e) {
        console.error(e);
      }
    } else if (points < cost) {
      setToast({ message: `No tienes suficientes puntos para canjear esto.`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };
  
  useEffect(() => {
    // Simulate real-time power consumption fluctuation
    const interval = setInterval(() => {
      setRealTimePower(prev => {
        // Random fluctuation between -0.1 and +0.1 kW
        const fluctuation = (Math.random() * 0.2) - 0.1;
        // Keep it between 0.5 and 3.5 kW
        const newValue = Math.max(0.5, Math.min(3.5, prev + fluctuation));
        return Number(newValue.toFixed(2));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      const productId = query.get('productId');
      const planId = query.get('planId');
      
      if (productId) {
        // Find product to add to purchases
        const product = catalogProducts.find(p => p.id.toString() === productId);
        if (product) {
          setCatalogProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
          const newPurchase = {
            id: `p${Date.now()}`,
            title: product.title,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            daysAgo: 0,
            price: `$${product.price.toFixed(2)}`,
            status: 'En camino',
            seller: 'Vendedor Local'
          };
          setPurchases(prev => [newPurchase, ...prev]);
        }
        setToast({ message: '¡Pago completado exitosamente! Tu pedido está en camino.', type: 'success' });
        setActiveTab('tienda');
        setTiendaMode('comprar');
        setBuyerView('purchases');
      } else if (planId) {
        setCurrentPlan(planId);
        setToast({ message: `¡Felicidades! Has actualizado exitosamente al plan ${planId}.`, type: 'success' });
        setActiveTab('planes');
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (query.get('canceled')) {
      setToast({ message: 'El pago fue cancelado.', type: 'error' });
      window.history.replaceState({}, document.title, window.location.pathname);
      // We don't change tab here so user stays where they were
    }
  }, [catalogProducts]);

  const handleUpgrade = async (planName: string) => {
    try {
      const resp = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName })
      });
      if (resp.ok) {
        setCurrentPlan(planName);
        setToast({ message: `¡Felicidades! Has actualizado exitosamente al plan ${planName}.`, type: 'success' });
      }
    } catch (e) {
      setToast({ message: 'Error al actualizar plan', type: 'error' });
    }
  };

  const initiatePlanBuy = (planName: string, price: number, description: string) => {
    setSelectedPlanForBuy({ id: planName, name: planName, price, description });
    setShowPlanPaymentModal(true);
  };

  const confirmPlanBuy = async (method: string) => {
    const plan = selectedPlanForBuy;
    if (!plan) return;
    
    setShowPlanPaymentModal(false);

    if (method === 'stripe') {
      try {
        setToast({ message: 'Conectando con pasarela de pago...', type: 'info' });
        
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'plan',
            plan: { id: plan.id, name: plan.name, price: plan.price, description: plan.description },
            appUrl: window.location.origin
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al procesar el pago');
        }

        if (data.demo) {
          setToast({ message: `Modo Demo: Simulando pago de plan ${plan.name}...`, type: 'info' });
          setTimeout(() => {
            window.location.href = data.url;
          }, 1500);
          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (error: any) {
        console.error('Payment error:', error);
        setToast({ message: error.message || 'Error al conectar con el pago', type: 'error' });
      }
    } else {
      // Simulate other payment methods
      setToast({ message: `Procesando pago vía ${method}...`, type: 'info' });
      setTimeout(async () => {
        try {
          await fetch('/api/user/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: plan.id })
          });
          setCurrentPlan(plan.id);
          setToast({ message: `¡Felicidades! Has actualizado exitosamente al plan ${plan.name}.`, type: 'success' });
          setActiveTab('planes');
        } catch(e) {}
      }, 2000);
    }
  };

  const electricityRate = 0.14; // $ per kWh

  // --- Dynamic Tip Logic ---
  const getDynamicTip = () => {
    const hour = new Date().getHours();
    const month = new Date().getMonth(); // 0-11
    
    let tip = "";
    let IconComponent = Lightbulb;
    let iconColor = "text-amber-500";
    let bgColor = "bg-amber-100";

    const isWinter = month === 11 || month === 0 || month === 1;
    const isSummer = month >= 5 && month <= 7;

    if (hour >= 6 && hour < 10) {
      tip = "Aprovecha la luz natural de la mañana y apaga las luces innecesarias. ¡Abre las persianas!";
      IconComponent = Sun;
      iconColor = "text-amber-500";
      bgColor = "bg-amber-100";
    } else if (hour >= 10 && hour < 14) {
      if (isSummer) {
        tip = "Es la hora de más calor. Cierra las persianas donde da el sol directo para reducir el uso del aire acondicionado.";
        IconComponent = ThermometerSun;
        iconColor = "text-orange-500";
        bgColor = "bg-orange-100";
      } else {
        tip = "Usa la lavadora a carga completa. Evita lavar con agua caliente si no es estrictamente necesario.";
        IconComponent = Droplets;
        iconColor = "text-blue-500";
        bgColor = "bg-blue-100";
      }
    } else if (hour >= 14 && hour < 18) {
      tip = "Desconecta los cargadores y dispositivos que no estés usando. La 'energía vampiro' puede sumar hasta un 10% de tu factura.";
      IconComponent = Plug;
      iconColor = "text-zinc-500";
      bgColor = "bg-zinc-100";
    } else if (hour >= 18 && hour < 22) {
      if (isWinter) {
        tip = "Baja la temperatura del termostato un par de grados y abrígate un poco más. Cada grado ahorra un 7% de energía.";
        IconComponent = ThermometerSnowflake;
        iconColor = "text-cyan-500";
        bgColor = "bg-cyan-100";
      } else {
        tip = "Evita usar el horno en estas horas pico. Opta por el microondas o la freidora de aire, consumen mucho menos.";
        IconComponent = Flame;
        iconColor = "text-orange-500";
        bgColor = "bg-orange-100";
      }
    } else {
      tip = "Programa tus electrodomésticos de alto consumo (lavavajillas, lavadora) para que funcionen de madrugada, cuando la tarifa suele ser más barata.";
      IconComponent = Moon;
      iconColor = "text-indigo-500";
      bgColor = "bg-indigo-100";
    }

    return { tip, IconComponent, iconColor, bgColor };
  };

  const dynamicTip = getDynamicTip();

  // --- Cálculos Automáticos ---
  const devicesWithStats = myDevices.map(d => {
    const dailyKwh = (d.powerW * d.hoursPerDay) / 1000;
    const monthlyKwh = dailyKwh * 30;
    const cost = monthlyKwh * electricityRate;
    
    let status = 'normal';
    let alert = null;
    if (cost > 20) {
      status = 'warning';
      alert = `Consumo alto detectado. Este dispositivo representa un gasto de $${cost.toFixed(2)} al mes.`;
    } else if (cost < 5) {
      status = 'optimized';
    }

    return { ...d, dailyKwh, monthlyKwh, cost, status, alert };
  }).sort((a, b) => b.cost - a.cost);

  const totalMonthlyCost = devicesWithStats.reduce((sum, d) => sum + d.cost, 0);
  const totalMonthlyKwh = devicesWithStats.reduce((sum, d) => sum + d.monthlyKwh, 0);
  const budget = 100;

  // Generar datos para la gráfica basados en el consumo total
  const dailyTotalCost = totalMonthlyCost / 30;
  const weeklyData = [
    { day: 'Lun', cost: dailyTotalCost * 0.9 },
    { day: 'Mar', cost: dailyTotalCost * 1.1 },
    { day: 'Mié', cost: dailyTotalCost * 0.8 },
    { day: 'Jue', cost: dailyTotalCost * 1.2 },
    { day: 'Vie', cost: dailyTotalCost * 1.5 }, // Pico
    { day: 'Sáb', cost: dailyTotalCost * 1.3 },
    { day: 'Dom', cost: dailyTotalCost * 0.9 },
  ];

  // Recomendaciones Inteligentes (IA)
  const recommendations = devicesWithStats
    .filter(d => d.powerW > 1000 && d.hoursPerDay > 3)
    .map((d, idx) => ({
      id: `rec-${idx}`,
      title: `Optimiza tu ${d.name}`,
      desc: `Reducir el uso de este dispositivo en solo 1 hora al día te ahorraría $${((d.powerW * 30 / 1000) * electricityRate).toFixed(2)} este mes.`,
      impact: 'Alto Impacto',
      icon: iconMap[d.iconName] || Lightbulb,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }));
    
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default',
      title: 'Patrón Eficiente',
      desc: 'Tus electrodomésticos están operando dentro de rangos óptimos. ¡Sigue así!',
      impact: 'Impacto Bajo',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    });
  }

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.powerW || !newDevice.hoursPerDay) return;
    
    const baseDeviceParams = {
      name: newDevice.name,
      iconName: 'Zap',
      powerW: Number(newDevice.powerW),
      hoursPerDay: Number(newDevice.hoursPerDay)
    };

    try {
      const resp = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseDeviceParams)
      });
      const data = await resp.json();
      setMyDevices([...myDevices, data]);
      setNewDevice({ name: '', powerW: '', hoursPerDay: '' });
      setActiveTab('resumen');
    } catch (e) {
      setToast({ message: 'Error agregando el dispositivo en la BD.', type: 'error' });
    }
  };

  const providers = [
    { id: 'smartthings', name: 'SmartThings', color: 'bg-blue-500', text: 'text-white' },
    { id: 'homeassistant', name: 'Home Assistant', color: 'bg-blue-600', text: 'text-white' },
    { id: 'tuya', name: 'Tuya / Smart Life', color: 'bg-orange-500', text: 'text-white' },
    { id: 'hue', name: 'Philips Hue', color: 'bg-zinc-800', text: 'text-white' },
    { id: 'govee', name: 'Govee', color: 'bg-indigo-500', text: 'text-white' },
    { id: 'lifx', name: 'LIFX', color: 'bg-purple-500', text: 'text-white' },
    { id: 'shelly', name: 'Shelly Cloud', color: 'bg-cyan-500', text: 'text-white' },
    { id: 'ewelink', name: 'eWeLink (Sonoff)', color: 'bg-blue-400', text: 'text-white' },
    { id: 'switchbot', name: 'SwitchBot', color: 'bg-red-500', text: 'text-white' },
    { id: 'kasa', name: 'TP-Link Kasa', color: 'bg-teal-500', text: 'text-white' },
    { id: 'nice', name: 'Nice Viewer', color: 'bg-stone-600', text: 'text-white' },
    { id: 'lutron', name: 'Lutron', color: 'bg-zinc-900', text: 'text-white' },
  ];

  const syncRealDevices = async (providerId: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/devices/sync/${providerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || `Error al conectar con ${providerId}`);
      }

      if (data.devices && data.devices.length > 0) {
        const newDevices = data.devices.filter((d: any) => !myDevices.some(md => md.id === d.id));
        if (newDevices.length > 0) {
          setMyDevices(prev => [...prev, ...newDevices]);
          setToast({ message: `¡Se sincronizaron ${newDevices.length} dispositivos de ${providerId}!`, type: 'success' });
        } else {
          setToast({ message: 'Tus dispositivos ya están actualizados.', type: 'info' });
        }
      } else {
        setToast({ message: 'No se encontraron dispositivos en tu cuenta.', type: 'info' });
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const renderAnalysis = () => (
    <div className="space-y-6">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          Análisis de Gasto 📊
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Desglose detallado de tu consumo energético.
        </motion.p>
      </header>
      
      {currentPlan === 'Básico' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Análisis Detallado Bloqueado</h2>
          <p className="text-zinc-500 mb-6 max-w-md">Para ver gráficas históricas, tendencias de consumo y desglose por horas, necesitas actualizar tu plan.</p>
          <button onClick={() => setActiveTab('planes')} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">
            Ver Planes
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-zinc-900">Gasto (Últimos 7 días)</h2>
            <select className="bg-zinc-50 border border-zinc-200 text-sm rounded-xl px-3 py-2 text-zinc-700 font-medium outline-none focus:border-emerald-500">
              <option>Esta Semana</option>
              <option>Este Mes</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cost" name="Costo ($)" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cost > 3 ? '#f43f5e' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          Ahorro IA 🤖
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Recomendaciones inteligentes basadas en tus hábitos.
        </motion.p>
      </header>

      {currentPlan === 'Básico' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <Lightbulb className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Ahorro IA Bloqueado</h2>
          <p className="text-zinc-500 mb-6 max-w-md">La Inteligencia Artificial de EcoHogar requiere el plan Eco o Pro Ultimate para analizar tus patrones y darte recomendaciones personalizadas.</p>
          <button onClick={() => setActiveTab('planes')} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">
            Actualizar a Eco
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl ${rec.bgColor} ${rec.color}`}>
                    <rec.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                    {rec.impact}
                  </span>
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{rec.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{rec.desc}</p>
                <button className="text-sm font-bold text-emerald-600 flex items-center gap-1 group">
                  Aplicar ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          Tu consumo está bajo control 🌿
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Aquí tienes el resumen de tu energía y cómo puedes ahorrar más hoy.
        </motion.p>
      </header>

      {/* Top Row: Prediction & Real-time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prediction Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-zinc-600 font-medium">
              <Calendar className="w-5 h-5" />
              <h2>Predicción de Factura (Marzo)</h2>
            </div>
            <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2 py-1 rounded-md">Faltan 12 días</span>
          </div>
          
          <div className="flex items-end gap-3 mb-2">
            <span className="text-5xl font-bold tracking-tighter text-zinc-900">${totalMonthlyCost.toFixed(2)}</span>
            <span className="text-zinc-500 font-medium mb-1 line-through">${(totalMonthlyCost * 1.15).toFixed(2)}</span>
          </div>
          
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 mb-6">
            <TrendingDown className="w-4 h-4" /> Vas a ahorrar ${(totalMonthlyCost * 0.15).toFixed(2)} respecto al mes pasado.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>Gasto actual: ${(totalMonthlyCost * 0.6).toFixed(2)}</span>
              <span>Presupuesto: ${budget.toFixed(2)}</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full relative ${totalMonthlyCost > budget ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((totalMonthlyCost / budget) * 100, 100)}%` }}></div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Measurement & Tip Column */}
        <div className="flex flex-col gap-6">
          {/* Real-time Measurement */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-zinc-900 text-white p-6 rounded-3xl shadow-md relative overflow-hidden flex-1">
            <div className="absolute -right-10 -top-10 opacity-10">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-zinc-300 font-medium">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h2>Consumo en Tiempo Real</h2>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">En vivo</span>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bold tracking-tighter">{realTimePower.toFixed(2)}</span>
                <span className="text-xl text-zinc-400 font-medium">kW</span>
              </div>
              
              <p className="text-sm text-zinc-400 mb-6">Equivale a unos ${(realTimePower * electricityRate).toFixed(2)} por hora.</p>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm text-zinc-200">Consumo estable. No hay picos inusuales detectados en los últimos 30 min.</p>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Tip Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${dynamicTip.bgColor} shrink-0`}>
              <dynamicTip.IconComponent className={`w-6 h-6 ${dynamicTip.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Consejo del Momento</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{dynamicTip.tip}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Middle Row: Analysis & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Detection (NILM) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-zinc-900">Tus Electrodomésticos</h2>
            <Info className="w-5 h-5 text-zinc-400" />
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {devicesWithStats.slice(0, 5).map((device, idx) => {
              const Icon = iconMap[device.iconName] || Zap;
              const usagePercent = ((device.cost / totalMonthlyCost) * 100).toFixed(0);
              return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${device.status === 'warning' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{device.name}</p>
                      <p className="text-xs text-zinc-500 font-medium">${device.cost.toFixed(2)} este mes</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-zinc-700">{usagePercent}%</span>
                </div>
                
                <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${device.status === 'warning' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>

                {device.alert && (
                  <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <p>{device.alert}</p>
                  </div>
                )}
              </div>
            )})}
          </div>
          
          <button onClick={() => setActiveTab('dispositivos')} className="w-full mt-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
            Gestionar dispositivos
          </button>
        </motion.div>

        {/* Plan Specific Widgets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center items-center text-center">
          {currentPlan === 'Básico' ? (
            <>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Lock className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">Funciones Avanzadas</h3>
              <p className="text-xs text-zinc-500 mb-4">Actualiza tu plan para desbloquear el Smart Meter y funciones Solares.</p>
              <button onClick={() => setActiveTab('planes')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                Ver Planes
              </button>
            </>
          ) : currentPlan === 'Eco' ? (
            <>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 shadow-sm relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">Smart Meter Activo</h3>
              <p className="text-xs text-zinc-500 mb-4">Conectado y analizando tu consumo en tiempo real.</p>
              <div className="w-full bg-white p-3 rounded-xl border border-zinc-100 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-700">Flujo Actual</span>
                  <span className="text-xs font-bold text-emerald-600">450W</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">Solar & EV Activo</h3>
              <p className="text-xs text-zinc-500 mb-4">Optimizando la carga de tu vehículo y uso de paneles.</p>
              <div className="w-full bg-white p-3 rounded-xl border border-zinc-100 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-700">Generación</span>
                  <span className="text-xs font-bold text-amber-600">1.2kW</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1">
                  <div className="bg-amber-500 h-1 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          Registro de Electrodomésticos 🔌
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Añade tus dispositivos para que la IA calcule tu consumo y te dé recomendaciones.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario y Conexión */}
        <div className="space-y-6">
          {/* Conexión IoT Real */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900 p-6 rounded-3xl shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <Activity className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-white mb-2">Sincronizar Ecosistema</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Selecciona la marca de tus dispositivos para conectarlos directamente a la aplicación usando su API oficial.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {providers.map(provider => (
                  <button 
                    key={provider.id}
                    onClick={() => syncRealDevices(provider.id)}
                    disabled={isSyncing}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs ${provider.color} ${provider.text} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50`}
                  >
                    {isSyncing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Plug className="w-4 h-4" />
                    )}
                    {provider.name}
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-zinc-500 mt-4 text-center">
                Requiere configurar el token de la marca seleccionada en las variables de entorno.
              </p>
            </div>
          </motion.div>

          {/* Formulario Manual */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Añadir Manualmente</h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del aparato</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Microondas" 
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={newDevice.name}
                onChange={e => setNewDevice({...newDevice, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Potencia (Watts)</label>
              <input 
                type="number" 
                required
                placeholder="Ej. 1200" 
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={newDevice.powerW}
                onChange={e => setNewDevice({...newDevice, powerW: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Horas de uso al día</label>
              <input 
                type="number" 
                required
                step="0.1"
                placeholder="Ej. 1.5" 
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={newDevice.hoursPerDay}
                onChange={e => setNewDevice({...newDevice, hoursPerDay: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-2">
              Registrar Dispositivo
            </button>
          </form>
        </motion.div>
        </div>

        {/* Lista de Dispositivos */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Tus Dispositivos Registrados</h2>
          {devicesWithStats.map((device) => {
            const Icon = iconMap[device.iconName as keyof typeof iconMap] || Zap;
            const isReal = (device as any).isReal;
            
            return (
              <div key={device.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isReal ? 'bg-emerald-100 text-emerald-600' : device.status === 'warning' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900">{device.name}</h3>
                      {isReal && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          En línea
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{device.powerW}W • {isReal ? 'Tiempo real' : `${device.hoursPerDay}h/día`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Consumo Mes</p>
                    <p className="font-mono font-bold text-zinc-900">{device.monthlyKwh.toFixed(1)} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Costo Estimado</p>
                    <p className={`font-mono font-bold ${device.status === 'warning' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${device.cost.toFixed(2)}
                    </p>
                  </div>
                  <button 
                    onClick={() => setMyDevices(myDevices.filter(d => d.id !== device.id))}
                    className="text-zinc-400 hover:text-rose-500 transition-colors p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );

  const renderRetos = () => (
    <div className="space-y-8">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
          Retos de Ahorro <Gamepad2 className="w-6 h-6 text-indigo-500" />
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Completa misiones diarias, gana puntos y sube de nivel mientras salvas el planeta.
        </motion.p>
      </header>

      {/* Level & Progress Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex flex-col items-center justify-center shrink-0 shadow-xl">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-100">Nivel</span>
            <span className="text-5xl font-black tracking-tighter">{currentLevel}</span>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">¡Sigue así!</h2>
                <p className="text-indigo-100 text-sm">Tienes {points} puntos en total.</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-indigo-100">Faltan {pointsToNextLevel} pts</span>
              </div>
            </div>
            <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Challenges */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-500" /> Misiones Diarias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyChallenges.map((challenge, idx) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            return (
              <motion.div 
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * idx }}
                className={`p-5 rounded-3xl border shadow-sm flex flex-col h-full transition-all ${isCompleted ? 'bg-zinc-50 border-zinc-200 opacity-70' : 'bg-white border-zinc-200 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-zinc-200 text-zinc-500' : challenge.bg + ' ' + challenge.color}`}>
                    <challenge.icon className="w-6 h-6" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isCompleted ? 'bg-zinc-200 text-zinc-500' : 'bg-amber-100 text-amber-600'}`}>
                    <Star className="w-3 h-3 fill-current" /> +{challenge.points}
                  </div>
                </div>
                <h3 className={`font-bold mb-2 ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>{challenge.title}</h3>
                <p className="text-sm text-zinc-500 mb-6 flex-1">{challenge.desc}</p>
                
                <button 
                  onClick={() => completeChallenge(challenge.id, challenge.points)}
                  disabled={isCompleted}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isCompleted 
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {isCompleted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Completado</>
                  ) : (
                    'Completar Reto'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Badges / Achievements */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-500" /> Insignias y Logros
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((badge, idx) => {
            const isUnlocked = currentLevel >= badge.reqLevel;
            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 + (0.05 * idx) }}
                className={`p-4 rounded-3xl border flex flex-col items-center text-center transition-all ${
                  isUnlocked 
                    ? 'bg-white border-zinc-200 shadow-sm hover:shadow-md' 
                    : 'bg-zinc-50 border-zinc-100 grayscale opacity-60'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? badge.bg + ' ' + badge.color : 'bg-zinc-200 text-zinc-400'}`}>
                  <badge.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 mb-1">{badge.title}</h3>
                <p className="text-[10px] text-zinc-500 leading-tight">{badge.desc}</p>
                {!isUnlocked && (
                  <div className="mt-3 px-2 py-1 bg-zinc-200 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Nivel {badge.reqLevel}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rewards Store */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" /> Tienda de Recompensas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward, idx) => {
            const isRedeemed = redeemedRewards.includes(reward.id);
            const canAfford = points >= reward.cost;
            return (
              <motion.div 
                key={reward.id}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 + (0.1 * idx) }}
                className={`p-5 rounded-3xl border shadow-sm flex flex-col h-full transition-all ${isRedeemed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-zinc-200 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isRedeemed ? 'bg-emerald-100 text-emerald-600' : reward.bg + ' ' + reward.color}`}>
                    <reward.icon className="w-6 h-6" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isRedeemed ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-600'}`}>
                    <Star className="w-3 h-3 fill-current" /> {reward.cost} pts
                  </div>
                </div>
                <h3 className={`font-bold mb-2 ${isRedeemed ? 'text-emerald-900' : 'text-zinc-900'}`}>{reward.title}</h3>
                <p className="text-sm text-zinc-500 mb-6 flex-1">{reward.desc}</p>
                
                <button 
                  onClick={() => redeemReward(reward.id, reward.cost, reward.title)}
                  disabled={isRedeemed || (!canAfford && !isRedeemed)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isRedeemed 
                      ? 'bg-emerald-500 text-white cursor-not-allowed' 
                      : canAfford 
                        ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {isRedeemed ? (
                    <><CheckCircle2 className="w-4 h-4" /> Canjeado</>
                  ) : (
                    'Canjear Recompensa'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProUltimate = () => (
    <div className="space-y-6">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
          Centro Pro Ultimate <Crown className="w-6 h-6 text-emerald-500 fill-emerald-500" />
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
          Control total y automatización avanzada para tu hogar electrificado.
        </motion.p>
      </header>

      {currentPlan !== 'Pro' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-10 rounded-3xl border border-emerald-900/50 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold uppercase tracking-wider shadow-lg">
            Premium
          </div>
          <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Funciones Exclusivas Bloqueadas</h2>
          <p className="text-zinc-400 mb-8 max-w-lg text-sm leading-relaxed">
            El Centro Pro Ultimate es tu central de mando para la electrificación total. Optimiza tus paneles solares, gestiona baterías, habilita carga bidireccional (V2H/V2G) para tu EV y vende excedentes de energía automáticamente al mejor precio.
          </p>
          <button onClick={() => setActiveTab('planes')} className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-zinc-900 font-bold rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5">
            Actualizar a Pro Ultimate
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Solar Panel Control Dashboard */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden text-white">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Control de Paneles Solares</h2>
                  <p className="text-sm text-zinc-400">Sistema fotovoltaico activo y optimizado</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                En línea
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
              {/* Energía Producida */}
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium uppercase tracking-wider">Energía Producida</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">28.4</span>
                  <span className="text-zinc-500 font-medium">kWh</span>
                </div>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 rotate-180" /> +12% vs ayer
                </div>
              </div>

              {/* Energía Usada */}
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Home className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium uppercase tracking-wider">Energía Usada</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">14.2</span>
                  <span className="text-zinc-500 font-medium">kWh</span>
                </div>
                <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                  50% de la producción total
                </div>
              </div>

              {/* Ahorro en Dinero */}
              <div className="p-6 flex flex-col justify-center bg-emerald-950/20">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium uppercase tracking-wider">Ahorro Generado</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400">$124.50</span>
                </div>
                <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
                  Este mes (estimado)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Smart EV Charging (V2H/V2G) */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Carga Bidireccional EV</h3>
                  <p className="text-xs text-zinc-500">V2H / V2G Activo</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform shadow-sm"></div>
              </div>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Tu coche eléctrico está alimentando la casa durante el pico de tarifas (6:00 PM - 9:00 PM) y se recargará con exceso solar mañana.
            </p>
            <div className="bg-zinc-50 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-500">Ahorro estimado este mes:</span>
              <span className="text-sm font-bold text-emerald-600">+$85.50</span>
            </div>
          </div>

          {/* Solar Surplus Market */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Trading Solar IA</h3>
                  <p className="text-xs text-zinc-500">Venta automática a la red</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform shadow-sm"></div>
              </div>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Vendiendo automáticamente 3.2kW de exceso solar. El algoritmo detectó un pico en el precio de compra de la red eléctrica.
            </p>
            <div className="bg-zinc-50 p-3 rounded-xl flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-500">Ganancias generadas hoy:</span>
              <span className="text-sm font-bold text-emerald-600">+$12.40</span>
            </div>
          </div>

          {/* Home Battery Status */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Battery className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Batería Doméstica</h3>
                  <p className="text-xs text-zinc-500">Almacenamiento Inteligente</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                85% Cargada
              </span>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Almacenando exceso de energía solar. Se reservará un 20% para emergencias y el resto se usará esta noche.
            </p>
            <div className="w-full bg-zinc-100 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0%</span>
              <span>Autonomía est.: 14 hrs</span>
              <span>100%</span>
            </div>
          </div>

          {/* Weather Prediction */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Pronóstico de Generación</h3>
                  <p className="text-xs text-zinc-500">Optimización Meteorológica</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Mañana estará mayormente soleado. Se espera generar <span className="font-bold">24 kWh</span>. 
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  <span className="font-medium">Recomendación IA</span>
                </div>
                <span className="font-bold">Retrasar lavado a mañana (11 AM)</span>
              </div>
            </div>
          </div>

          {/* VIP Consulting */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-sm hover:shadow-md transition-shadow text-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Asesoría VIP en Electrificación</h3>
                    <p className="text-xs text-zinc-400">Subsidios y expansión solar</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-300 mb-6">
                Programa tu sesión mensual con un ingeniero para optimizar tu instalación solar, tramitar subsidios o planear la compra de baterías.
              </p>
            </div>
            <button className="w-full py-2.5 bg-white text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-100 transition-colors mt-auto">
              Agendar Sesión de Marzo
            </button>
          </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-8">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
          Modelo de Negocio SaaS
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-lg">
          Planes diseñados para escalar. Desde usuarios curiosos hasta hogares 100% inteligentes y electrificados.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* Free Tier */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Básico</h3>
          <p className="text-zinc-500 text-sm mb-6 h-10">Para quienes quieren empezar a entender su consumo.</p>
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter text-zinc-900">$4.99</span>
              <span className="text-zinc-500">/mes</span>
            </div>
            <div className="mt-2 inline-block px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
              Prueba gratis de 10 días
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Monitoreo automático básico', 'Historial de 30 días', 'Alertas de presupuesto ilimitadas', 'Comparativa con hogares similares', 'Exportación de datos (CSV/PDF)', 'Consejos de ahorro semanales', 'Soporte por email'].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                <Check className="w-5 h-5 text-zinc-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleUpgrade('Básico')}
              disabled={currentPlan === 'Básico'}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${currentPlan === 'Básico' ? 'text-zinc-400 bg-zinc-100 cursor-not-allowed' : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200'}`}
            >
              {currentPlan === 'Básico' ? 'Plan Actual' : 'Iniciar prueba gratis'}
            </button>
            {currentPlan !== 'Básico' && (
              <button 
                onClick={() => initiatePlanBuy('Básico', 4.99, 'Plan Básico - Monitoreo automático')}
                className="w-full py-3 rounded-xl font-bold transition-colors text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
              >
                Pagar membresía
              </button>
            )}
          </div>
        </motion.div>

        {/* Eco Tier (Hero) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900 p-8 rounded-3xl shadow-xl flex flex-col relative transform md:-translate-y-4 border border-zinc-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Más Popular
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Eco Inteligente</h3>
          <p className="text-zinc-400 text-sm mb-6 h-10">IA predictiva y automatización para maximizar el ahorro.</p>
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter text-white">$9.99</span>
              <span className="text-zinc-400">/mes</span>
            </div>
            <div className="mt-2 inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-md border border-emerald-500/30">
              Prueba gratis de 5 días
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Conexión a medidor inteligente (Smart Meter)', 'Desagregación por electrodoméstico (NILM)', 'Recomendaciones IA personalizadas', 'Historial ilimitado', 'Alertas de anomalías en tiempo real', 'Integración con asistentes de voz'].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleUpgrade('Eco')}
              disabled={currentPlan === 'Eco'}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${currentPlan === 'Eco' ? 'text-emerald-900 bg-emerald-500 cursor-not-allowed' : 'text-zinc-900 bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'}`}
            >
              {currentPlan === 'Eco' ? 'Plan Actual' : 'Iniciar prueba gratis'}
            </button>
            {currentPlan !== 'Eco' && (
              <button 
                onClick={() => initiatePlanBuy('Eco', 9.99, 'Plan Eco Inteligente - IA predictiva')}
                className="w-full py-3 rounded-xl font-bold transition-colors text-emerald-400 bg-zinc-800 hover:bg-zinc-700 border border-emerald-500/30"
              >
                Pagar membresía
              </button>
            )}
          </div>
        </motion.div>

        {/* Pro Tier */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-8 rounded-3xl border border-emerald-900/50 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold uppercase tracking-wider shadow-lg">
            Premium
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Pro Ultimate <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </h3>
          <p className="text-zinc-400 text-sm mb-6 h-10">La solución definitiva con control total, automatización avanzada y asesoría VIP.</p>
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter text-white">$14.99</span>
              <span className="text-zinc-400">/mes</span>
            </div>
            <div className="mt-2 inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-md border border-emerald-500/30">
              Prueba gratis de 48 horas
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Todo lo del plan Eco', 'Gestión avanzada de inversores y baterías solares', 'Carga bidireccional de EV (V2H/V2G)', 'Trading automático de excedentes solares', 'Pronóstico meteorológico de generación', 'Asesoría VIP en subsidios y electrificación', 'Soporte prioritario 24/7'].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleUpgrade('Pro')}
              disabled={currentPlan === 'Pro'}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${currentPlan === 'Pro' ? 'text-emerald-900 bg-emerald-600 cursor-not-allowed opacity-80' : 'text-zinc-900 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transform hover:-translate-y-0.5'}`}
            >
              {currentPlan === 'Pro' ? 'Plan Actual' : 'Iniciar prueba gratis'}
            </button>
            {currentPlan !== 'Pro' && (
              <button 
                onClick={() => initiatePlanBuy('Pro', 14.99, 'Plan Pro Ultimate - Control total')}
                className="w-full py-3 rounded-xl font-bold transition-colors text-emerald-400 bg-zinc-800/50 hover:bg-zinc-800 border border-emerald-500/30"
              >
                Pagar membresía
              </button>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );

  const renderTienda = () => (
    <div className="space-y-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            Tienda EcoHogar <Store className="w-6 h-6 text-emerald-500" />
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 mt-1">
            {tiendaMode === 'comprar' 
              ? 'Equipa tu hogar con la mejor tecnología para ahorrar energía.'
              : 'Únete a nuestro marketplace y vende a miles de usuarios.'}
          </motion.p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => { setTiendaMode('comprar'); setSellerView('dashboard'); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tiendaMode === 'comprar' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Comprar
          </button>
          <button 
            onClick={() => { setTiendaMode('vender'); setBuyerView('catalog'); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tiendaMode === 'vender' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Vender
          </button>
        </div>
      </header>

      {tiendaMode === 'comprar' ? (
        buyerView === 'catalog' ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 inline-block px-3 py-1.5 rounded-lg">
                *Al comprar aquí apoyas a EcoHogar (recibimos un 10% de comisión por venta, el 90% es para el vendedor).
              </span>
              <button 
                onClick={() => setBuyerView('purchases')}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                Ver mis compras
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalogProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className={`absolute top-4 left-4 p-2 rounded-xl ${product.bg} ${product.color} shadow-sm backdrop-blur-md bg-white/90`}>
                    <product.icon className="w-5 h-5" />
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-zinc-900 shadow-sm">
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-zinc-900 mb-1">{product.title}</h3>
                  <p className="text-xs text-zinc-500 mb-4 flex-1">{product.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-black text-zinc-900">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => initiateBuy(product)}
                      disabled={product.stock <= 0}
                      className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 ${
                        product.stock > 0 ? 'bg-zinc-900 hover:bg-emerald-500' : 'bg-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" /> {product.stock > 0 ? 'Comprar' : 'Agotado'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-900">Mis Compras</h2>
              <button onClick={() => setBuyerView('catalog')} className="text-zinc-500 hover:text-zinc-900 font-medium text-sm">Volver al Catálogo</button>
            </div>
            
            <div className="space-y-4">
              {purchases.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">{p.title}</h3>
                    <p className="text-sm text-zinc-500">Vendido por: {p.seller} • Comprado el {p.date}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-black text-zinc-900">{p.price}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        p.status === 'Reembolsado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {p.status === 'Pendiente de Pago' && (
                      <div className="text-right">
                        <p className="text-xs text-amber-600 font-medium mb-2">Esperando pago y comprobante.</p>
                        <button 
                          onClick={() => handleUploadProofBuyer(p.id)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          Subir Comprobante
                        </button>
                      </div>
                    )}
                    {p.status === 'Verificando Pago' && (
                      <div className="text-right">
                        <p className="text-xs text-blue-600 font-medium mb-2">Comprobante enviado. Esperando verificación del vendedor.</p>
                      </div>
                    )}
                    {p.status === 'En camino' && p.daysAgo > 60 && (
                      <div className="text-right">
                        <p className="text-xs text-rose-500 font-medium mb-2">Han pasado más de 60 días sin entrega.</p>
                        <button 
                          onClick={() => handleRefund(p.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          Reportar no entregado (Reembolso)
                        </button>
                      </div>
                    )}
                    {p.status === 'Reembolsado' && (
                      <p className="text-xs text-rose-600 font-medium bg-rose-50 px-3 py-2 rounded-lg">
                        Dinero devuelto. Penalización aplicada al vendedor.
                      </p>
                    )}
                    {p.status === 'En camino' && p.daysAgo <= 60 && (
                      <p className="text-xs text-zinc-500">Entrega estimada en progreso...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      ) : sellerView === 'dashboard' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <Store className="w-64 h-64" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-6 border border-white/10">
                <Tag className="w-4 h-4" /> Portal de Vendedores
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Vende tus productos a una comunidad ecológica</h2>
              <p className="text-indigo-100 mb-8 text-lg">
                Llega a miles de usuarios interesados en eficiencia energética. Nuestro modelo es transparente: 
                <span className="font-bold text-white"> Tú te quedas con el 90% de la venta, la app solo retiene un 10% de comisión.</span>
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setSellerView('publish')}
                  className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" /> Publicar Producto
                </button>
                <button 
                  onClick={() => setSellerView('sales')}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
                >
                  Ver mis ventas
                </button>
                <button 
                  onClick={() => setSellerView('payments')}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
                >
                  Configurar Pagos
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Comisión Transparente</h3>
              <p className="text-sm text-zinc-500">
                Sin cuotas mensuales ni costos ocultos. Solo pagas un 10% de comisión por cada venta exitosa. El 90% va directo a tu cuenta.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Público Objetivo</h3>
              <p className="text-sm text-zinc-500">
                Tus productos se mostrarán a usuarios que ya están buscando activamente formas de ahorrar energía y electrificar su hogar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Pagos Seguros</h3>
              <p className="text-sm text-zinc-500">
                Procesamos todos los pagos de forma segura. Recibe tus ganancias directamente en tu cuenta bancaria cada semana.
              </p>
            </div>
          </div>
        </motion.div>
      ) : sellerView === 'publish' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Publicar Nuevo Producto</h2>
            <button onClick={() => setSellerView('dashboard')} className="text-zinc-500 hover:text-zinc-900 font-medium text-sm">Volver</button>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Nombre del Producto</label>
              <input 
                type="text" 
                value={newProductForm.title}
                onChange={e => setNewProductForm({...newProductForm, title: e.target.value})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="Ej. Panel Solar 500W" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Precio ($)</label>
                <input 
                  type="number" 
                  value={newProductForm.price}
                  onChange={e => setNewProductForm({...newProductForm, price: e.target.value})}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Cantidad (Stock)</label>
                <input 
                  type="number" 
                  value={newProductForm.stock}
                  onChange={e => setNewProductForm({...newProductForm, stock: e.target.value})}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="Ej. 10" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Categoría</label>
                <select 
                  value={newProductForm.category}
                  onChange={e => setNewProductForm({...newProductForm, category: e.target.value})}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option>Paneles Solares</option>
                  <option>Baterías</option>
                  <option>Enchufes Inteligentes</option>
                  <option>Sensores</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Descripción</label>
              <textarea 
                value={newProductForm.desc}
                onChange={e => setNewProductForm({...newProductForm, desc: e.target.value})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                rows={4} 
                placeholder="Describe tu producto..."
              ></textarea>
            </div>
            <button 
              onClick={() => {
                if (!newProductForm.title || !newProductForm.price || !newProductForm.stock) {
                  setToast({ message: 'Por favor completa todos los campos requeridos.', type: 'error' });
                  return;
                }
                
                const newProduct = {
                  id: Date.now(),
                  title: newProductForm.title,
                  desc: newProductForm.desc || 'Sin descripción',
                  price: parseFloat(newProductForm.price),
                  stock: parseInt(newProductForm.stock, 10),
                  icon: newProductForm.category === 'Paneles Solares' ? Sun : newProductForm.category === 'Baterías' ? Battery : newProductForm.category === 'Sensores' ? Activity : Plug,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-100',
                  image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400&h=300'
                };
                
                setCatalogProducts([newProduct, ...catalogProducts]);
                setNewProductForm({ title: '', price: '', category: 'Paneles Solares', desc: '', stock: '' });
                setToast({ message: 'Producto publicado con éxito en el catálogo.', type: 'success' });
                setSellerView('dashboard');
              }}
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors mt-4"
            >
              Publicar Producto
            </button>
          </div>
        </motion.div>
      ) : sellerView === 'payments' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Configuración de Pagos</h2>
            <button onClick={() => setSellerView('dashboard')} className="text-zinc-500 hover:text-zinc-900 font-medium text-sm">Volver</button>
          </div>
          
          <div className="space-y-6">
            <p className="text-sm text-zinc-500 mb-6">Configura los métodos de pago que aceptas en tu tienda. Los compradores podrán elegir entre las opciones que habilites.</p>

            {/* Stripe */}
            <div className="p-5 border border-zinc-200 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Tarjetas (Stripe)</h3>
                    <p className="text-xs text-zinc-500">Pagos automáticos con tarjeta de crédito/débito</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sellerPaymentMethods.stripe.enabled} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, stripe: { ...sellerPaymentMethods.stripe, enabled: e.target.checked }})} />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              {sellerPaymentMethods.stripe.enabled && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <p className="text-xs text-zinc-500 mb-2">Para recibir pagos automáticos, necesitas configurar tus claves de Stripe en el panel de administración o variables de entorno.</p>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Conectar cuenta de Stripe</button>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div className="p-5 border border-zinc-200 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">PayPal</h3>
                    <p className="text-xs text-zinc-500">Recibe pagos manuales a tu cuenta PayPal</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sellerPaymentMethods.paypal.enabled} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, paypal: { ...sellerPaymentMethods.paypal, enabled: e.target.checked }})} />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              {sellerPaymentMethods.paypal.enabled && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Correo de PayPal</label>
                  <input type="email" value={sellerPaymentMethods.paypal.email} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, paypal: { ...sellerPaymentMethods.paypal, email: e.target.value }})} placeholder="tu@correo.com" className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              )}
            </div>

            {/* Bancolombia */}
            <div className="p-5 border border-zinc-200 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Bancolombia</h3>
                    <p className="text-xs text-zinc-500">Transferencia bancaria directa</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sellerPaymentMethods.bancolombia.enabled} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, bancolombia: { ...sellerPaymentMethods.bancolombia, enabled: e.target.checked }})} />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              {sellerPaymentMethods.bancolombia.enabled && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Tipo de Cuenta</label>
                    <select value={sellerPaymentMethods.bancolombia.accountType} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, bancolombia: { ...sellerPaymentMethods.bancolombia, accountType: e.target.value }})} className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Ahorros</option>
                      <option>Corriente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Número de Cuenta</label>
                    <input type="text" value={sellerPaymentMethods.bancolombia.accountNumber} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, bancolombia: { ...sellerPaymentMethods.bancolombia, accountNumber: e.target.value }})} placeholder="Ej. 123456789" className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Titular de la Cuenta</label>
                    <input type="text" placeholder="Nombre completo" className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Nequi */}
            <div className="p-5 border border-zinc-200 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Nequi / DaviPlata</h3>
                    <p className="text-xs text-zinc-500">Billeteras digitales</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sellerPaymentMethods.nequi.enabled} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, nequi: { ...sellerPaymentMethods.nequi, enabled: e.target.checked }})} />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              {sellerPaymentMethods.nequi.enabled && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Billetera</label>
                    <select className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Nequi</option>
                      <option>DaviPlata</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Número de Celular</label>
                    <input type="text" value={sellerPaymentMethods.nequi.phone} onChange={(e) => setSellerPaymentMethods({...sellerPaymentMethods, nequi: { ...sellerPaymentMethods.nequi, phone: e.target.value }})} placeholder="Ej. 3001234567" className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                setToast({ message: 'Configuración de pagos guardada con éxito.', type: 'success' });
                setSellerView('dashboard');
              }}
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors mt-4"
            >
              Guardar Configuración
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-zinc-900">Dashboard de Vendedor</h2>
            <button onClick={() => setSellerView('dashboard')} className="text-zinc-500 hover:text-zinc-900 font-medium text-sm">Volver al Portal</button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Protege tus ventas</h4>
              <p className="text-sm text-blue-700 mt-1">Para evitar fraudes o reclamos falsos de compradores, te sugerimos tomar una foto del producto al momento de entregarlo o enviarlo. Sube la foto en tus transacciones en proceso. Estas fotos solo serán visibles para el dueño de la plataforma.</p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-sm font-bold text-zinc-500 mb-1">Ventas Totales</p>
              <p className="text-3xl font-black text-zinc-900">$12,450.00</p>
              <p className="text-xs text-emerald-500 mt-2 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3 rotate-180" /> +15% este mes</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-sm font-bold text-zinc-500 mb-1">Comisión App (10%)</p>
              <p className="text-3xl font-black text-rose-500">-$1,245.00</p>
              <p className="text-xs text-zinc-400 mt-2 font-medium">Retenido automáticamente</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <p className="text-sm font-bold text-emerald-700 mb-1">Ganancia Neta</p>
              <p className="text-3xl font-black text-emerald-600">$11,205.00</p>
              <p className="text-xs text-emerald-600 mt-2 font-medium">Disponible para retiro</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-zinc-900 mb-6">Evolución de Ventas (Últimos 7 días)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Lun', ventas: 1200 },
                    { name: 'Mar', ventas: 2100 },
                    { name: 'Mie', ventas: 800 },
                    { name: 'Jue', ventas: 1500 },
                    { name: 'Vie', ventas: 3200 },
                    { name: 'Sab', ventas: 4500 },
                    { name: 'Dom', ventas: 3800 },
                  ]}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dx={-10} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value}`, 'Ventas']}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-6">Productos Más Vendidos</h3>
              <div className="space-y-4">
                {[
                  { name: 'Kit Paneles Solares 5kW', sales: 12, rev: '$54,000' },
                  { name: 'Batería Doméstica 10kWh', sales: 8, rev: '$25,600' },
                  { name: 'Sensor de Energía', sales: 45, rev: '$5,805' },
                  { name: 'Enchufe Inteligente', sales: 120, rev: '$5,998' },
                ].map((prod, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 line-clamp-1">{prod.name}</p>
                      <p className="text-xs text-zinc-500">{prod.sales} unidades vendidas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">{prod.rev}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900">Transacciones Recientes</h3>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="p-4 font-bold">Producto</th>
                    <th className="p-4 font-bold">Fecha</th>
                    <th className="p-4 font-bold">Precio</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sellerOrders.map(order => (
                    <tr key={order.id}>
                      <td className="p-4 font-bold text-zinc-900">{order.product}</td>
                      <td className="p-4 text-zinc-500">{order.date}</td>
                      <td className="p-4 font-bold text-zinc-900">{order.price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          order.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 
                          order.status === 'Pago Subido' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.status === 'Pago Subido' && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => window.open(order.proofUrl || '', '_blank')}
                              className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <Camera className="w-3 h-3" /> Ver Comprobante
                            </button>
                            <button 
                              onClick={() => handleVerifyPayment(order.id)} 
                              className="text-xs bg-emerald-50 text-emerald-600 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Verificar Pago
                            </button>
                          </div>
                        )}
                        {order.status === 'En proceso' && !order.proofUrl && (
                          <button 
                            onClick={() => handleUploadProof(order.id)} 
                            className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3" /> Subir Foto
                          </button>
                        )}
                        {order.status === 'En proceso' && order.proofUrl && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Foto subida
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderFAQ = () => {
    const faqs = [
      {
        q: "¿Cómo se calcula mi ahorro de energía?",
        a: "Calculamos tu ahorro basándonos en tu tarifa eléctrica actual (que puedes ajustar en tu perfil) y el consumo reportado por tus electrodomésticos. Si tienes el plan Pro, usamos los datos en tiempo real de tu medidor inteligente para una precisión del 99%."
      },
      {
        q: "¿Cómo funciona la Tienda EcoHogar?",
        a: "La tienda es un marketplace donde puedes comprar equipos de eficiencia energética directamente de proveedores certificados. EcoHogar retiene una pequeña comisión (10%) por cada venta para mantener la plataforma, pero el 90% va directo al vendedor."
      },
      {
        q: "¿Qué beneficios tiene el plan Pro Ultimate?",
        a: "El plan Pro Ultimate incluye monitoreo en tiempo real, predicción de facturas con IA, automatización de enchufes inteligentes y acceso a un asesor VIP mensual para optimizar tu instalación solar o tramitar subsidios."
      },
      {
        q: "¿Cómo conecto mis dispositivos inteligentes?",
        a: "Ve a la pestaña 'Mis Electrodomésticos' y selecciona 'Añadir Dispositivo Inteligente'. Sigue las instrucciones en pantalla para enlazar tus enchufes Wi-Fi, termostatos o medidores compatibles."
      },
      {
        q: "¿Puedo vender mis propios productos en la tienda?",
        a: "¡Sí! Si eres un proveedor de tecnología verde, puedes cambiar al modo 'Vender' en la Tienda EcoHogar, crear tu perfil de vendedor y publicar tus productos. Nosotros nos encargamos de los pagos seguros."
      }
    ];

    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
            Preguntas Frecuentes
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-lg">
            Resolvemos tus dudas sobre EcoHogar, el ahorro de energía y nuestros planes.
          </motion.p>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-emerald-200">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-zinc-900 pr-4">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              {openIndex === index && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="px-6 pb-6 text-zinc-500 leading-relaxed"
                >
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>

        <div className="mt-12 bg-emerald-50 rounded-3xl p-8 text-center border border-emerald-100">
          <h3 className="font-bold text-zinc-900 mb-2">¿Aún tienes dudas?</h3>
          <p className="text-zinc-600 mb-6 text-sm">Nuestro equipo de soporte está listo para ayudarte en cualquier momento.</p>
          <button className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
            Contactar Soporte
          </button>
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
          Panel de Dueño <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-zinc-500 mt-1">Vista exclusiva para el dueño de la plataforma. Revisa las pruebas de entrega.</p>
      </header>
      
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900">Pruebas de Entrega (Subidas por Vendedores)</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sellerOrders.filter(o => o.proofUrl).length === 0 ? (
            <p className="text-zinc-500 text-sm">No hay fotos de prueba subidas aún.</p>
          ) : (
            sellerOrders.filter(o => o.proofUrl).map(order => (
              <div key={order.id} className="border border-zinc-200 rounded-2xl p-4 flex flex-col gap-4">
                <div>
                  <p className="font-bold text-zinc-900">{order.product}</p>
                  <p className="text-xs text-zinc-500">ID Venta: {order.id} • Fecha: {order.date}</p>
                </div>
                <img src={order.proofUrl!} alt="Prueba de entrega" className="w-full h-48 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div className="flex justify-end">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Prueba Registrada</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-800">EcoHogar</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'resumen', icon: Home, label: 'Resumen' },
            { id: 'tienda', icon: Store, label: 'Tienda EcoHogar' },
            { id: 'analisis', icon: BarChartIcon, label: 'Análisis de Gasto' },
            { id: 'dispositivos', icon: PieChart, label: 'Mis Electrodomésticos' },
            { id: 'recomendaciones', icon: Lightbulb, label: 'Ahorro IA' },
            { id: 'retos', icon: Gamepad2, label: 'Retos (Jugar)' },
            { id: 'pro-ultimate', icon: Crown, label: 'Centro Pro Ultimate' },
            { id: 'planes', icon: CreditCard, label: 'Planes y Suscripción' },
            { id: 'faq', icon: HelpCircle, label: 'Preguntas Frecuentes' },
            { id: 'admin', icon: ShieldCheck, label: 'Panel de Dueño' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
              RC
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-800">Familia Reyes Carrillo</p>
              <p className="text-xs text-zinc-500">Plan {currentPlan}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-zinc-900 text-white' : 
              toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
             toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-white" /> : <Info className="w-5 h-5 text-blue-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedProductForBuy && (
          <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900">Selecciona un método de pago</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-500 mb-4">Estás comprando: <span className="font-bold text-zinc-900">{selectedProductForBuy.title}</span> por <span className="font-bold text-emerald-600">${selectedProductForBuy.price.toFixed(2)}</span></p>
                
                {sellerPaymentMethods.stripe.enabled && (
                  <button onClick={() => confirmBuy('stripe')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-zinc-900">Tarjeta de Crédito / Débito</p>
                      <p className="text-xs text-zinc-500">Pago seguro vía Stripe</p>
                    </div>
                  </button>
                )}
                
                {sellerPaymentMethods.paypal.enabled && (
                  <button onClick={() => confirmBuy('paypal')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Globe className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-zinc-900">PayPal</p>
                      <p className="text-xs text-zinc-500">{sellerPaymentMethods.paypal.email}</p>
                    </div>
                  </button>
                )}

                {(sellerPaymentMethods.bancolombia.enabled || sellerPaymentMethods.nequi.enabled) && (
                  <button onClick={() => confirmBuy('mercadopago')} className="w-full p-4 border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl flex items-center gap-4 hover:border-sky-500 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shrink-0"><Smartphone className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-sky-900">MercadoPago</p>
                      <p className="text-xs text-sky-700">PSE, Nequi, Daviplata, Efecty y Tarjetas</p>
                    </div>
                  </button>
                )}

                {!sellerPaymentMethods.stripe.enabled && !sellerPaymentMethods.paypal.enabled && !sellerPaymentMethods.bancolombia.enabled && !sellerPaymentMethods.nequi.enabled && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium text-center">
                    El vendedor no ha configurado ningún método de pago.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {showPlanPaymentModal && selectedPlanForBuy && (
          <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900">Selecciona un método de pago</h3>
                <button onClick={() => setShowPlanPaymentModal(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-500 mb-4">Estás comprando: <span className="font-bold text-zinc-900">{selectedPlanForBuy.name}</span> por <span className="font-bold text-emerald-600">${selectedPlanForBuy.price.toFixed(2)}/mes</span></p>
                
                <button onClick={() => confirmPlanBuy('stripe')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-zinc-900">Tarjeta de Crédito / Débito</p>
                    <p className="text-xs text-zinc-500">Pago seguro vía Stripe</p>
                  </div>
                </button>
                
                <button onClick={() => confirmPlanBuy('paypal')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Globe className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-zinc-900">PayPal</p>
                    <p className="text-xs text-zinc-500">Paga con tu cuenta de PayPal</p>
                  </div>
                </button>

                <button onClick={() => confirmPlanBuy('bancolombia')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0"><Landmark className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-zinc-900">Transferencia Bancolombia</p>
                    <p className="text-xs text-zinc-500">Transferencia bancaria directa</p>
                  </div>
                </button>

                <button onClick={() => confirmPlanBuy('nequi')} className="w-full p-4 border border-zinc-200 rounded-2xl flex items-center gap-4 hover:border-rose-500 hover:bg-rose-50 transition-all text-left">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0"><Smartphone className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-zinc-900">Nequi / Daviplata</p>
                    <p className="text-xs text-zinc-500">Billeteras digitales</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {activeTab === 'planes' ? renderPricing() : 
           activeTab === 'dispositivos' ? renderDevices() : 
           activeTab === 'analisis' ? renderAnalysis() :
           activeTab === 'recomendaciones' ? renderRecommendations() :
           activeTab === 'retos' ? renderRetos() :
           activeTab === 'tienda' ? renderTienda() :
           activeTab === 'pro-ultimate' ? renderProUltimate() :
           activeTab === 'faq' ? renderFAQ() :
           activeTab === 'admin' ? renderAdmin() :
           renderDashboard()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around p-3 z-50">
        {[
          { id: 'resumen', icon: Home, label: 'Inicio' },
          { id: 'tienda', icon: Store, label: 'Tienda' },
          { id: 'analisis', icon: BarChartIcon, label: 'Gasto' },
          { id: 'retos', icon: Gamepad2, label: 'Retos' },
          { id: 'pro-ultimate', icon: Crown, label: 'Pro' },
          { id: 'faq', icon: HelpCircle, label: 'Ayuda' },
          { id: 'admin', icon: ShieldCheck, label: 'Admin' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
              activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
