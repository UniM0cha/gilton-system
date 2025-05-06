# 길튼 시스템 개발 워크플로우

이 문서는 길튼 시스템의 개발 워크플로우와 코드 구조에 대한 설명입니다.

## 프로젝트 구조

```
gilton-system/
├── electron/             # Electron 서버 코드
│   ├── config/           # 설정 파일
│   ├── routes/           # 라우팅 모듈 (HTTP, WebSocket, IPC)
│   ├── types/            # 타입 정의
│   ├── main.ts           # 메인 진입점
│   ├── paths.ts          # 경로 관련 유틸리티
│   ├── preload.ts        # 프리로드 스크립트
│   └── window.ts         # 윈도우 관리
├── src/
│   ├── client/           # 클라이언트 코드
│   │   ├── components/   # 리액트 컴포넌트
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── lib/          # 유틸리티 라이브러리
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── stores/       # 상태 관리
│   │   ├── styles/       # 스타일
│   │   ├── types/        # 타입 정의
│   │   ├── utils/        # 유틸리티 함수
│   │   └── main.tsx      # 클라이언트 진입점
│   └── shared/           # 공유 코드
├── dist/                 # 빌드 결과물
├── public/               # 정적 파일
├── tsconfig.json         # TypeScript 설정
├── tsconfig.client.json  # 클라이언트 TypeScript 설정
├── tsconfig.electron.json # Electron TypeScript 설정
└── vite.config.ts        # Vite 설정
```

## 개발 환경 설정

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 개발 모드 실행:
   ```bash
   npm run dev
   ```
   이 명령어는 다음 두 가지를 동시에 실행합니다:
   - `npm run dev:client`: Vite 개발 서버 (포트 3000)
   - `npm run dev:electron`: Electron 앱 (포트 3001)

3. 빌드:
   ```bash
   npm run build
   ```

## 코드 구조 및 설계 원칙

### 1. 모듈화

- **라우팅 분리**: HTTP, WebSocket, IPC 라우팅이 각각 별도의 파일로 분리되어 있습니다.
- **설정 분리**: CORS 설정과 같은 공통 설정은 별도의 파일로 분리되어 있습니다.
- **유틸리티 함수**: 공통 기능은 유틸리티 함수로 분리되어 있습니다.

### 2. 타입 안전성

- TypeScript를 사용하여 타입 안전성을 보장합니다.
- 공유 타입 정의를 사용하여 클라이언트와 서버 간의 일관성을 유지합니다.

### 3. 코드 중복 방지

- 공통 기능은 유틸리티 함수로 분리하여 코드 중복을 방지합니다.
- 설정 값은 중앙에서 관리하여 일관성을 유지합니다.

## 주요 기능 및 구현 방식

### 1. 실시간 통신

- Socket.IO를 사용하여 클라이언트와 서버 간의 실시간 통신을 구현합니다.
- 웹소켓 서버는 HTTP 서버와 동일한 포트에서 실행됩니다.

### 2. 파일 업로드

- 클라이언트에서는 `uploadSheetMusic` 유틸리티 함수를 사용하여 파일을 업로드합니다.
- Electron 환경에서는 IPC를 통해, 브라우저 환경에서는 HTTP API를 통해 업로드합니다.

### 3. CORS 설정

- HTTP 서버와 WebSocket 서버는 동일한 CORS 설정을 사용합니다.
- 설정은 `electron/config/cors.ts` 파일에서 중앙 관리됩니다.

## 개발 시 주의사항

1. **CORS 설정**: 새로운 오리진을 추가해야 할 경우 `electron/config/cors.ts` 파일을 수정하세요.
2. **파일 업로드**: 파일 업로드 로직을 수정해야 할 경우 `src/client/utils/uploadUtils.ts` 파일을 수정하세요.
3. **타입 정의**: 클라이언트와 서버 간에 공유되는 타입은 `src/shared/types/dtos.ts`에 정의되어 있습니다.

## 린팅 및 타입 검사

코드 품질을 유지하기 위해 다음 명령어를 사용하세요:

```bash
# 린팅
npm run lint

# 타입 검사 (클라이언트)
npx tsc -p tsconfig.client.json --noEmit

# 타입 검사 (Electron)
npx tsc -p tsconfig.electron.json --noEmit
```

## 배포

1. 빌드:
   ```bash
   npm run build
   ```

2. 실행:
   ```bash
   npm run start
   ```
