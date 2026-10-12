# 감정 일기 — React + Supabase

하루의 감정과 짧은 기록을 남기고, 어느 기기에서나 다시 확인할 수 있는 웹 일기입니다.
실습 절차는 [`guide.md`](./guide.md)를 참고하세요.

## 소개

감정 일기는 오늘의 마음을 간단히 기록하고 모아볼 수 있는 앱입니다.
기쁨, 평온, 슬픔, 화남, 불안 중 하나를 선택해 내용을 저장할 수 있으며, 기록은 최신순으로 표시됩니다.
감정별 필터와 삭제 기능도 제공하고, 로딩·저장 중·오류·빈 상태를 화면에 안내합니다.

## 어떻게 만들었나요

Vite와 React로 기본 프로젝트를 준비한 뒤, Copilot Plan 모드에서 PRD를 바탕으로 구조와 상태를 정리하고 Agent로 구현했습니다.
Tailwind CSS Vite 플러그인을 추가해 화면을 구성하고, Supabase 클라이언트와 데이터 함수를 컴포넌트에서 분리했습니다.

- 화면과 상태 관리: [`src/App.jsx`](./src/App.jsx)
- Supabase 클라이언트: [`src/lib/supabase.js`](./src/lib/supabase.js)
- 조회·추가·삭제 API: [`src/api/diaries.js`](./src/api/diaries.js)
- Tailwind 설정: [`vite.config.js`](./vite.config.js), [`src/index.css`](./src/index.css)

## 데이터는 어디에 저장되나요

Supabase의 `diaries` 테이블에 저장합니다.

| 컬럼 | 설명 |
| --- | --- |
| `id` | DB가 자동 생성하는 일기 식별자 |
| `content` | 일기 내용 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | DB가 자동 생성하는 작성 시각 |

6주차의 `localStorage` 방식은 현재 사용한 브라우저에만 데이터가 저장되지만, Supabase 방식은 원격 데이터베이스에 저장됩니다.
따라서 같은 Supabase 프로젝트를 사용하는 다른 기기나 브라우저에서도 새로고침 후 같은 기록을 볼 수 있습니다.

## 보안에서 확인한 것

Supabase URL과 Publishable key는 `.env.local`의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 환경변수로 관리하며, `.gitignore`에 `.env.*`가 등록되어 있어 GitHub에 올리지 않습니다.
실행에 필요한 값은 `.env.example`을 참고해 설정합니다. Secret key나 `service_role` 키는 프론트엔드에 사용하지 않습니다.

Publishable key는 브라우저에서 Supabase 요청을 만들기 때문에 개발자 도구의 Network 탭에서 보일 수 있습니다.
이 키를 숨기는 것이 아니라 Supabase의 `grant` 권한과 RLS 정책으로 테이블 접근을 제한합니다.
현재 실습용 정책은 누구나 읽기·쓰기·삭제할 수 있는 구조이므로, 실제 서비스에서는 Supabase Auth를 적용하고 사용자별 RLS 정책으로 바꿔야 합니다.

## 실행 방법

### 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local에 Supabase URL과 Publishable key 입력
npm run dev
```

검증 명령:

```bash
npm run build
npm run lint
```

### 배포

Netlify 배포 링크: 배포 후 추가 예정

빌드 명령은 `npm run build`, 배포 디렉터리는 `dist`를 사용합니다.
배포 환경에도 로컬과 같은 두 개의 `VITE_` 환경변수를 등록해야 합니다.

## 커스터마이징한 부분

- 기록 수를 보여주는 헤더와 `daily pause` 콘셉트의 차분한 색상·타이포그래피를 적용했습니다.
- 감정별 색상과 이모지를 사용해 기록을 빠르게 구분할 수 있도록 했습니다.
- 반응형 레이아웃을 적용해 모바일과 데스크톱에서 모두 사용할 수 있습니다.
- 저장 중 중복 제출 방지, 삭제 중 상태 표시, 오류 닫기, 감정 필터를 추가했습니다.
