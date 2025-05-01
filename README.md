# 길튼 시스템 (Gilton System)

교회 찬양팀 예배 진행 중 악보 공유, 명령 전달, 드로잉 등을 실시간으로 지원하는 웹 애플리케이션입니다.

## 프로젝트 개요

- **클라이언트(PWA 웹앱)**: iPad에서 설치 없이 사용 가능한 웹 애플리케이션
- **서버(Electron 앱)**: macOS에서 실행되는 관리 및 통신용 데스크탑 앱
- **기기 간 연결**: 동일 Wi-Fi 하에 WebSocket으로 통신

## 주요 기능

- **사용자 프로필 관리**: 역할(세션/인도자/목사님), 닉네임, 아이콘, 자주 쓰는 명령 등록
- **악보 공유**: 실시간 악보 페이지 동기화
- **드로잉 기능**: 악보 위에 자유롭게 그림 그리기 및 실시간 공유
- **명령 전달**: 역할별 권한에 따른 명령 전송 및 수신
- **관리자 인터페이스**: 접속 중인 사용자 모니터링, 데이터 초기화 등

## 기술 스택

### 클라이언트 (PWA)

- **React 18**
- **React Router v7**
- **Zustand** - 상태 관리
- **React Query** - 데이터 패칭
- **Socket.io-client** - 실시간 통신
- **Tailwind CSS** - 스타일링

### 서버 (Electron + Node)

- **Electron**
- **Express** - 내장 서버
- **Socket.io** - 실시간 통신
- **React** - 관리자 UI

## 설치 및 실행

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/yourusername/gilton-system.git
cd gilton-system

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev
```

### 빌드

```bash
# 클라이언트 및 서버 빌드
npm run build

# 서버 실행
npm run start
```

## 사용 방법

1. **서버 실행**: Electron 앱을 실행하여 서버를 시작합니다.
2. **클라이언트 접속**: 동일한 Wi-Fi 네트워크에서 브라우저로 서버 URL에 접속합니다.
3. **프로필 설정**: 첫 접속 시 역할, 닉네임, 아이콘을 설정합니다.
4. **예배 진행**: 악보 보기, 그리기, 명령 전송 등의 기능을 사용합니다.

## 데이터 저장

모든 데이터는 JSON 파일로 Electron 앱의 사용자 데이터 디렉토리에 저장됩니다:

- `profiles.json` - 사용자 프로필
- `commands.json` - 명령 목록
- `sessions.json` - 세션 정보

## 라이센스

MIT
