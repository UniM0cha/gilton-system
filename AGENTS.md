# AGENT 지침

## 범위

이 지침은 리포지토리의 모든 파일에 적용됩니다.

## 개발

- 클라이언트 코드는 `client/`에, 서버 코드는 `server/`에 위치합니다.
- `client/` 또는 `server/` 디렉터리의 코드를 수정할 때는 커밋 전에 다음 명령을 실행해야 합니다:
  - 변경한 패키지 디렉터리에서 `npm run lint`
  - 테스트 스크립트가 존재하면 `npm test`
- 새 클라이언트 코드는 TypeScript와 React를 사용해야 합니다.
- 사용자의 지시가 README 업데이트를 요구하는 경우에만 README를 수정합니다.
- 작업이 완료되면 항상 커밋을 수행합니다.
- 앞으로 모든 문서는 한국어로 작성합니다.
- 모든 PR 설명은 한국어로 작성합니다.
