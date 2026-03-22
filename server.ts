import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { TuyaContext } from '@tuya/tuya-connector-nodejs';
import Stripe from "stripe";
import { exec } from "child_process";

dotenv.config();

// Base de datos en memoria (compatible con StackBlitz)
let nextDeviceId = 6;
const db = {
  user: {
    id: 1,
    name: 'Demo User',
    points: 0,
    plan: 'Básico'
  },
  devices: [
    { id: 1, user_id: 1, name: 'Aire Acondicionado', iconName: 'Wind', powerW: 1500, hoursPerDay: 5 },
    { id: 2, user_id: 1, name: 'Refrigerador', iconName: 'Thermometer', powerW: 250, hoursPerDay: 24 },
    { id: 3, user_id: 1, name: 'Calentador de Agua', iconName: 'Droplets', powerW: 2000, hoursPerDay: 2 },
    { id: 4, user_id: 1, name: 'TV y Consolas', iconName: 'Power', powerW: 200, hoursPerDay: 4 },
    { id: 5, user_id: 1, name: 'Iluminación LED', iconName: 'Lightbulb', powerW: 100, hoursPerDay: 6 }
  ]
};


let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || (!key.startsWith('sk_test_') && !key.startsWith('sk_live_'))) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/download-source", (req, res) => {
    const outputPath = path.join('/tmp', 'ecohogar-source.tar.gz');
    // Compress the current directory, excluding node_modules and .git
    exec(`tar -czf ${outputPath} --exclude=node_modules --exclude=dist --exclude=.git .`, { cwd: process.cwd() }, (error) => {
      if (error) {
        console.error('Tar error:', error);
        return res.status(500).send('Error creating archive');
      }
      res.download(outputPath, 'ecohogar-source.tar.gz');
    });
  });

  // RUTAS EN MEMORIA
  app.get('/api/user', (req, res) => {
    res.json(db.user);
  });

  app.post('/api/user/points', (req, res) => {
    const { points } = req.body;
    db.user.points += points;
    res.json({ points: db.user.points });
  });

  app.post('/api/user/plan', (req, res) => {
    const { plan } = req.body;
    db.user.plan = plan;
    res.json({ success: true, plan });
  });

  app.get('/api/devices', (req, res) => {
    res.json(db.devices);
  });

  app.post('/api/devices', (req, res) => {
    const { name, iconName, powerW, hoursPerDay } = req.body;
    const newDevice = { id: nextDeviceId++, user_id: 1, name, iconName, powerW, hoursPerDay };
    db.devices.push(newDevice);
    res.json(newDevice);
  });


  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { product, plan, type, appUrl } = req.body;
      
      let successUrl = '';
      let lineItems = [];

      if (type === 'plan') {
        successUrl = `${appUrl}?success=true&planId=${plan.id}`;
        lineItems = [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Plan ${plan.name}`,
                description: plan.description,
              },
              unit_amount: Math.round(plan.price * 100),
            },
            quantity: 1,
          },
        ];
      } else {
        successUrl = `${appUrl}?success=true&productId=${product.id}`;
        lineItems = [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                description: product.desc,
                images: [product.image],
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity: 1,
          },
        ];
      }

      let paymentIntentData = undefined;

      // Si es un producto del mercado (no un plan) determinamos la partición de ganancias (Stripe Connect)
      if (type !== 'plan' && product.sellerStripeAccountId) {
        const totalAmount = Math.round(product.price * 100);
        const applicationFeeAmount = Math.round(totalAmount * 0.10); // 10% se queda en la cuenta principal (EcoHogar)
        
        paymentIntentData = {
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: product.sellerStripeAccountId, // El 90% restante se va al vendedor automáticamente
          },
        };
      }

      if (!stripe) {
        // Fallback to demo mode if Stripe is not configured
        return res.json({ id: 'demo_session', url: successUrl, demo: true });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        payment_intent_data: paymentIntentData,
        success_url: successUrl,
        cancel_url: `${appUrl}?canceled=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      // Intentionally not logging to console.error to prevent AI Studio error overlay
      // when users enter invalid test keys.
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-mercadopago-preference", async (req, res) => {
    try {
      const { product, plan, type, appUrl, sellerMpAccountId } = req.body;
      
      let title = type === 'plan' ? `Plan ${plan.name}` : product.title;
      let price = type === 'plan' ? plan.price : product.price;

      // Determinamos el fee de marketplace (10%) si es un producto de tienda
      let marketplaceFee = 0;
      if (type !== 'plan' && sellerMpAccountId) {
         marketplaceFee = Math.round(price * 0.10); // 10% a plataforma, resto al access_token del sub seller
      }

      const body = {
        items: [{
          title: title,
          quantity: 1,
          unit_price: price,
        }],
        marketplace_fee: marketplaceFee > 0 ? marketplaceFee : undefined,
        back_urls: {
          success: `${appUrl}?success=true&${type === 'plan' ? 'planId='+plan.id : 'productId='+product.id}`,
          failure: `${appUrl}?canceled=true`
        },
        auto_return: "approved"
      };

      // Si tuviéramos accessToken usaríamos el SDK o fetch directo:
      if (!process.env.MP_ACCESS_TOKEN) {
        // Fallback a modo Demo
        const demoUrl = `${appUrl}?success=true&${type === 'plan' ? 'planId='+plan.id : 'productId='+product.id}`;
        return res.json({ id: 'demo_mp', url: demoUrl, demo: true });
      }

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await mpResponse.json();
      
      if (!mpResponse.ok) {
        throw new Error(data.message || 'Error con MercadoPago');
      }

      res.json({ id: data.id, url: data.init_point });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unified Smart Home Integration Route
  app.get("/api/devices/sync/:provider", async (req, res) => {
    const { provider } = req.params;

    try {
      switch (provider) {
        case 'smartthings': {
          const token = process.env.SMARTTHINGS_TOKEN;
          if (!token) return res.status(401).json({ error: "Falta el Token", message: "Configura SMARTTHINGS_TOKEN en tus variables de entorno." });
          
          const response = await fetch('https://api.smartthings.com/v1/devices', {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          });
          if (!response.ok) throw new Error((await response.json()).error?.message || 'Error al conectar con SmartThings');
          
          const data = await response.json();
          const mappedDevices = data.items.map((device: any) => {
            let iconName = 'Power';
            const category = device.categories?.[0]?.name?.toLowerCase() || '';
            if (category.includes('airconditioner')) iconName = 'Wind';
            else if (category.includes('light')) iconName = 'Lightbulb';
            else if (category.includes('plug') || category.includes('outlet')) iconName = 'Plug';
            else if (category.includes('refrigerator')) iconName = 'Thermometer';
            else if (category.includes('meter')) iconName = 'Activity';

            return { id: device.deviceId, name: device.label || device.name, iconName, powerW: 0, hoursPerDay: 0, isReal: true, status: 'online' };
          });
          return res.json({ devices: mappedDevices });
        }

        case 'homeassistant': {
          const url = process.env.HA_URL;
          const token = process.env.HA_TOKEN;
          if (!url || !token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura HA_URL y HA_TOKEN en tus variables de entorno." });
          
          const response = await fetch(`${url}/api/states`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (!response.ok) throw new Error('Error al conectar con Home Assistant');
          
          const data = await response.json();
          // Filter only relevant entities (switches, lights, climate, sensors)
          const relevantEntities = data.filter((e: any) => e.entity_id.startsWith('switch.') || e.entity_id.startsWith('light.') || e.entity_id.startsWith('climate.'));
          
          const mappedDevices = relevantEntities.map((device: any) => {
            let iconName = 'Power';
            if (device.entity_id.startsWith('light.')) iconName = 'Lightbulb';
            else if (device.entity_id.startsWith('switch.')) iconName = 'Plug';
            else if (device.entity_id.startsWith('climate.')) iconName = 'Wind';

            return { id: device.entity_id, name: device.attributes.friendly_name || device.entity_id, iconName, powerW: 0, hoursPerDay: 0, isReal: true, status: device.state === 'unavailable' ? 'offline' : 'online' };
          });
          return res.json({ devices: mappedDevices });
        }

        case 'tuya': {
          const accessKey = process.env.TUYA_CLIENT_ID;
          const secretKey = process.env.TUYA_CLIENT_SECRET;
          const uid = process.env.TUYA_UID;
          
          if (!accessKey || !secretKey) {
            return res.status(401).json({ error: "Faltan Credenciales", message: "Configura TUYA_CLIENT_ID y TUYA_CLIENT_SECRET en tus variables de entorno." });
          }
          
          if (!uid) {
            return res.status(401).json({ error: "Falta TUYA_UID", message: "Para obtener tus dispositivos reales de Tuya, también necesitas configurar la variable TUYA_UID con tu User ID de la app Smart Life." });
          }

          const tuya = new TuyaContext({
            baseUrl: 'https://openapi.tuyaus.com',
            accessKey,
            secretKey,
          });

          const response = await tuya.request({
            method: 'GET',
            path: `/v1.0/users/${uid}/devices`,
          });

          if (!response.success) {
            throw new Error(response.msg || 'Error al conectar con Tuya');
          }

          const mappedDevices = (response.result || []).map((device: any) => {
            let iconName = 'Power';
            const category = device.category || '';
            
            if (category === 'kt') iconName = 'Wind';
            else if (category === 'dj') iconName = 'Lightbulb';
            else if (category === 'cz') iconName = 'Plug';
            else if (category === 'weibolu') iconName = 'Flame';
            else if (category === 'bx') iconName = 'Thermometer';
            else if (category === 'xyj') iconName = 'Activity';
            else if (category === 'zndb') iconName = 'Activity';

            return {
              id: device.id,
              name: device.name,
              iconName,
              powerW: 0,
              hoursPerDay: 0,
              isReal: true,
              status: device.online ? 'online' : 'offline'
            };
          });

          return res.json({ devices: mappedDevices });
        }

        case 'hue': {
          const bridgeIp = process.env.HUE_BRIDGE_IP;
          const username = process.env.HUE_USERNAME;
          if (!bridgeIp || !username) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura HUE_BRIDGE_IP y HUE_USERNAME en tus variables de entorno." });
          
          const response = await fetch(`http://${bridgeIp}/api/${username}/lights`);
          if (!response.ok) throw new Error('Error al conectar con Philips Hue Bridge');
          
          const data = await response.json();
          const mappedDevices = Object.keys(data).map(key => ({
            id: `hue-${key}`, name: data[key].name, iconName: 'Lightbulb', powerW: 0, hoursPerDay: 0, isReal: true, status: data[key].state.reachable ? 'online' : 'offline'
          }));
          return res.json({ devices: mappedDevices });
        }

        case 'govee': {
          const apiKey = process.env.GOVEE_API_KEY;
          if (!apiKey) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura GOVEE_API_KEY en tus variables de entorno." });
          
          const response = await fetch('https://developer-api.govee.com/v1/devices', {
            headers: { 'Govee-API-Key': apiKey }
          });
          if (!response.ok) throw new Error('Error al conectar con Govee');
          
          const data = await response.json();
          const mappedDevices = (data.data?.devices || []).map((device: any) => ({
            id: device.device, name: device.deviceName, iconName: 'Lightbulb', powerW: 0, hoursPerDay: 0, isReal: true, status: 'online'
          }));
          return res.json({ devices: mappedDevices });
        }

        case 'lifx': {
          const token = process.env.LIFX_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura LIFX_TOKEN en tus variables de entorno." });
          
          const response = await fetch('https://api.lifx.com/v1/lights/all', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Error al conectar con LIFX');
          
          const data = await response.json();
          const mappedDevices = data.map((device: any) => ({
            id: device.id, name: device.label, iconName: 'Lightbulb', powerW: 0, hoursPerDay: 0, isReal: true, status: device.connected ? 'online' : 'offline'
          }));
          return res.json({ devices: mappedDevices });
        }

        case 'shelly': {
          const authKey = process.env.SHELLY_AUTH_KEY;
          const server = process.env.SHELLY_SERVER;
          if (!authKey || !server) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura SHELLY_AUTH_KEY y SHELLY_SERVER en tus variables de entorno." });
          
          const response = await fetch(`https://${server}/device/all_status?auth_key=${authKey}`);
          if (!response.ok) throw new Error('Error al conectar con Shelly Cloud');
          
          const data = await response.json();
          const mappedDevices = Object.keys(data.data.devices_status).map(key => ({
            id: key, name: `Shelly Device ${key}`, iconName: 'Plug', powerW: 0, hoursPerDay: 0, isReal: true, status: 'online'
          }));
          return res.json({ devices: mappedDevices });
        }

        case 'ewelink': {
          const token = process.env.EWELINK_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura EWELINK_TOKEN en tus variables de entorno." });
          throw new Error("La API de eWeLink requiere firma. Token detectado, se requiere SDK completo.");
        }

        case 'switchbot': {
          const token = process.env.SWITCHBOT_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura SWITCHBOT_TOKEN en tus variables de entorno." });
          
          const response = await fetch('https://api.switch-bot.com/v1.0/devices', {
            headers: { 'Authorization': token }
          });
          if (!response.ok) throw new Error('Error al conectar con SwitchBot');
          
          const data = await response.json();
          const mappedDevices = data.body.deviceList.map((device: any) => ({
            id: device.deviceId, name: device.deviceName, iconName: device.deviceType.includes('Light') ? 'Lightbulb' : 'Plug', powerW: 0, hoursPerDay: 0, isReal: true, status: 'online'
          }));
          return res.json({ devices: mappedDevices });
        }

        case 'kasa': {
          const token = process.env.KASA_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura KASA_TOKEN en tus variables de entorno." });
          throw new Error("La API de TP-Link Kasa requiere peticiones RPC específicas. Token detectado.");
        }

        case 'nice': {
          const token = process.env.NICE_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura NICE_TOKEN en tus variables de entorno." });
          throw new Error("La integración con Nice Viewer requiere configuración de red local o acceso a la nube de Nice. Token detectado.");
        }

        case 'lutron': {
          const token = process.env.LUTRON_TOKEN;
          if (!token) return res.status(401).json({ error: "Faltan Credenciales", message: "Configura LUTRON_TOKEN en tus variables de entorno." });
          throw new Error("La API de Lutron (LEAP) requiere certificados TLS para conexión local. Token detectado.");
        }

        default:
          return res.status(400).json({ error: "Proveedor no soportado", message: "El proveedor seleccionado no está implementado." });
      }
    } catch (error: any) {
      console.error(`Error fetching real devices for ${provider}:`, error);
      res.status(500).json({ error: "Error de conexión", details: error.message });
    }
  });

  // Handle unmatched API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "Ruta de API no encontrada" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
