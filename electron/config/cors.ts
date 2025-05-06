// CORS 설정 모듈
// HTTP 서버와 WebSocket 서버에서 공유하는 CORS 설정

// 허용할 오리진 목록
export const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

// HTTP 서버용 CORS 설정
export const httpCorsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// WebSocket 서버용 CORS 설정
export const wsCorsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};
