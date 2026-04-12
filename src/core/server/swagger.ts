import { requestSwagger } from "@components/Request/request.swagger";
import { requestTemplateSwagger } from "@components/RequestTemplate/requestTemplate.swagger";
import { taskSwagger } from "@components/Task/task.swagger";
import { taskTemplateSwagger } from "@components/TemplateTask/taskTemplate.swagger";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { healthSwagger } from "./controllers/health.swagger";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SGD RRHH API",
    version: "1.0.0",
    description:
      "API Documentation for SGD RRHH System - Modo desarrollo: no se requiere autenticación",
  },
  servers: [
    {
      url: `http://localhost:${config.port}/rrhh/api/v1`,
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          statusCode: { type: "integer" },
        },
      },
    },
    securitySchemes: {},
  },
  paths: {
    ...healthSwagger.paths,
    ...requestSwagger.paths,
    ...taskTemplateSwagger.paths,
    ...requestTemplateSwagger.paths,
    ...taskSwagger.paths,
  },
};

// Combinar componentes
function mergeComponents(target: any, source: any) {
  if (!source?.components) return;

  if (source.components.schemas) {
    Object.assign(target.components.schemas, source.components.schemas);
  }
}

mergeComponents(swaggerDocument, healthSwagger);
mergeComponents(swaggerDocument, requestSwagger);
mergeComponents(swaggerDocument, taskTemplateSwagger);
mergeComponents(swaggerDocument, requestTemplateSwagger);
mergeComponents(swaggerDocument, taskSwagger);
mergeComponents(swaggerDocument, taskTemplateSwagger);

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    
    /* Banner de modo Swagger activo */
    .swagger-ui .info {
      position: relative;
    }
    .swagger-ui .info::before {
      content: "🔐 MODO SWAGGER ACTIVO - No se requiere autenticación real";
      display: block;
      background: #d4edda;
      color: #155724;
      padding: 12px;
      margin: 0 0 20px 0;
      border-radius: 4px;
      border: 1px solid #c3e6cb;
      font-weight: bold;
      text-align: center;
      font-size: 14px;
    }
    
    /* Banner adicional */
    .swagger-ui .information-container {
      border: 2px solid #28a745 !important;
      border-radius: 5px;
    }
  `,
  customSiteTitle: "SGD RRHH API - SWAGGER MODE",
  swaggerOptions: {
    persistAuthorization: false,
    tryItOutEnabled: true,
    withCredentials: true,
    requestInterceptor: (request: any) => {
      // ✅ FORZAR LA COOKIE SWAGGER EN CADA REQUEST
      if (!request.headers) request.headers = {};

      // Siempre agregar swaggerCookie a las requests
      const existingCookies = request.headers.Cookie || request.headers.cookie || "";
      let newCookies = existingCookies;

      if (!existingCookies.includes("swaggerCookie")) {
        newCookies = existingCookies
          ? `${existingCookies}; swaggerCookie=true`
          : "swaggerCookie=true";
      }

      request.headers.Cookie = newCookies;
      request.headers.cookie = newCookies; // Ambos casos
      request.credentials = "include";

      console.log("🔐 Swagger Request - Cookies being sent:", newCookies);

      return request;
    },
    responseInterceptor: (response: any) => {
      console.log("🔐 Swagger Response - Status:", response.status, response.url);
      return response;
    },
    displayRequestDuration: true,
    filter: true,
    docExpansion: "none",
  },
  customJs: `
    // Script para configurar el modo Swagger
    window.onload = function() {
      console.log('🔐 Swagger UI loaded - Setting up Swagger Bypass Mode');
      
      // ✅ SOLUCIÓN ALTERNATIVA: Usar localStorage para detectar Swagger
      localStorage.setItem('swaggerMode', 'true');
      console.log('✅ Swagger mode activated via localStorage');
      
      // Intentar establecer cookies de todas formas
      function setCookies() {
        // Diferentes formas de establecer cookies
        const cookieOptions = [
          'swaggerCookie=true; path=/; max-age=3600',
          'swaggerCookie=true; path=/; max-age=3600; samesite=lax',
          'swaggerCookie=true; path=/marketing/api/v1; max-age=3600',
          'swaggerCookie=true; path=/api-docs; max-age=3600'
        ];
        
        cookieOptions.forEach(opt => {
          document.cookie = opt;
        });
        
        // Verificar
        const cookies = document.cookie;
        console.log('🍪 Cookies after setting:', cookies);
        
        if (!cookies.includes('swaggerCookie')) {
          console.warn('⚠️ Cookies may be blocked by browser settings');
        }
        
        showSwaggerBanner();
      }
      
      function showSwaggerBanner() {
        // Banner visual
        const banner = document.createElement('div');
        banner.style.cssText = \`
          position: fixed;
          top: 10px;
          right: 10px;
          background: #28a745;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          z-index: 10000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        \`;
        banner.innerHTML = '🔐 SWAGGER MODE ACTIVE';
        document.body.appendChild(banner);
        
        // Info adicional
        const infoContainer = document.querySelector('.information-container');
        if (infoContainer) {
          const infoBanner = document.createElement('div');
          infoBanner.style.cssText = \`
            background: #d4edda;
            color: #155724;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border: 1px solid #c3e6cb;
            font-weight: bold;
          \`;
          infoBanner.innerHTML = '💡 <strong>Modo Desarrollo:</strong> Autenticación bypass activada';
          infoContainer.appendChild(infoBanner);
        }
      }
      
      setCookies();
      
      // Override de fetch para forzar cookies
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        console.log('🔐 Swagger fetch intercepted:', args[0]);
        
        if (args[1]) {
          if (!args[1].headers) args[1].headers = {};
          
          // Forzar cookie swagger en todas las requests
          const existingHeaders = args[1].headers;
          let cookieHeader = existingHeaders.Cookie || existingHeaders.cookie || '';
          
          if (!cookieHeader.includes('swaggerCookie')) {
            cookieHeader = cookieHeader ? cookieHeader + '; swaggerCookie=true' : 'swaggerCookie=true';
          }
          
          args[1].headers.Cookie = cookieHeader;
          args[1].headers.cookie = cookieHeader;
          args[1].credentials = 'include';
        }
        
        return originalFetch.apply(this, args);
      };
    }
  `,
};

export const setupSwagger = (app: Express): void => {
  // Middleware para establecer cookies de Swagger
  app.use("/api-docs", (req, res, next) => {
    // ✅ ESTABLECER COOKIE EN TODAS LAS RUTAS DE API-DOCS
    res.cookie("swaggerCookie", "true", {
      maxAge: 3600000, // 1 hora
      httpOnly: false,
      secure: false, // ❗IMPORTANTE: false en desarrollo
      sameSite: "lax", // ❗IMPORTANTE: lax o none
      path: "/",
    });

    console.log("🍪 Setting swaggerCookie for:", req.path);
    next();
  });

  // Ruta para el JSON de Swagger
  app.get("/api-docs/swagger.json", (_, res) => {
    console.log("📄 Serving Swagger JSON");
    res.json(swaggerDocument);
  });

  // UI de Swagger
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

  console.log("📚 Swagger documentation available at /api-docs");
  console.log("🔐 SWAGGER BYPASS MODE ACTIVATED");
  console.log("🌐 Server URL:", `http://localhost:${config.port}/rrhh/api/v1`);
  console.log("📖 Swagger UI:", `http://localhost:${config.port}/api-docs`);
};
