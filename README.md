# team7-week1-2

원티드 프론트엔드 프리온보딩 7차 7팀 1-2 과제 레포리토리입니다

## :: 주요 기능

1. Context API와 API 연동

- Context API를 생성, 최상위 컴포넌트에서 Provider로 state를 제공해주었습니다.
- 또한 state관리의 용이성을 위해 최상위 파일에서 모든 로직을 담당했습니다.
- `useFetch` 커스텀 훅을 활용해 Data Fetching 부분을 분리하였습니다.

```typescript
export interface IssueContextInterface {
  issueList: Issue[];
  isLoading: boolean;
  errors: boolean;
}

export const IssueContext = createContext<IssueContextInterface>(null);
```

```typescript
function App() {
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, errors] = useFetch(setIssueList, page);

  return (
    <IssueContext.Provider value={{ issueList, isLoading, errors }}>
    //...생략
```

```typescript
function IssuesPage({ setPage }: Props) {
  const { issueList, isLoading, errors } = useContext(IssueContext);
  //...
}
```

```typescript
function useFetch(
  setIssueList: Dispatch<SetStateAction<Issue[]>>,
  page: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(false);

  const handleFetch = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const data = await IssuesService.getIssues(page);
        setIssueList(prev => [...prev, ...data]);
      } catch (error) {
        setErrors(true);
      } finally {
        setIsLoading(false);
      }
    },
    [setIssueList]
  );

  useEffect(() => {
    handleFetch(page);
  }, [page, handleFetch]);

  return [isLoading, errors];
}
```

<br />

2. 로딩, 에러 처리

- errors, isLoading 스테이트를 활용하였습니다.
- 에러가 있을 경우 `<Error / >` 컴포넌트가 렌더됩니다.
- 로딩 중일 경우 `<Loading />` 컴포넌트가 렌더됩니다.
- 구현 초기엔 `<Error />` 컴포넌트 바로 다음 `<Loading />` 컴포넌트가 위치해있었습니다. 이 경우 무한 스크롤 페칭 중 데이터 부분이 사라지고 로딩으로 변했다 다시 돌아오는 부자연스러운 렌더를 보여주었습니다. 따라서 `<Loading />` 컴포넌트는 `<IssueItem />` 최하단으로 위치시켰습니다.

```jsx
if (errors) {
  return <Error />;
}

return (
  <>
    <ul>
      {issueList &&
        issueList.map((issue, idx) => {
          return (
            <li key={issue.number} style={{ listStyle: 'none' }}>
              {idx === 4 && <AdBanner />}
              <IssueItem issue={issue} />
            </li>
          );
        })}
    </ul>
    <div ref={setObserveTarget as any} />

    {isLoading && <Loading />}
  </>
);
```

<br/>

3. 무한 스크롤

- javascript에서 제공하는 intersectionObserver API를 활용해 무한 스크롤을 구현하였습니다.
- 이슈 페이지 최하단에 observing을 위한 div를 만들어 두고, 해당 div가 intersecting 될 때 `setPage(prev => prev + 1)`을 통해 page를 넘겼습니다.
- page를 디펜던시로 하는 useEffect를 만들어 두어 page가 넘어갈 때마다 handleFetch(page)가 실행되도록 하였습니다.

```typescript
// @src/pages/IssuesPage.tsx
const setObserveTarget = useIntersectionObserver(setPage);
// 생략 ...
return (
  // ... 이슈 리스트 최하단
  <div ref={setObserveTarget as any} />
);
```

```typescript
useEffect(() => {
  handleFetch(page);
}, [page, handleFetch]);
```

```typescript
// @src/hooks/useIntersectionObserver
export const useIntersectionObserver = (
  setPage: Dispatch<SetStateAction<number>>
) => {
  const [observationTarget, setObservationTarget] = useState(null);

  const observer = useRef(
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPage(prev => prev + 1);
      },
      { threshold: 1 }
    )
  );

  useEffect(() => {
    const currentTarget = observationTarget;
    const currentObserver = observer.current;
    if (currentTarget) {
      currentObserver.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        currentObserver.unobserve(currentTarget);
      }
    };
  }, [observationTarget]);

  return setObservationTarget;
};
```

<br />

## :: 성장 포인트

- 컨텍스트 API를 처음 사용해보면서 어디에 Provider를 심어야 할지, 어떻게 Action을 받을지 전혀 감이 없었습니다.
- 간단한 APP이라 단순히 최상단 컴포넌트에 Provider와 setState 로직을 모아두어 해결했습니다.
- 다만 더 큰 프로젝트의 경우를 위해 Flux패턴이 구현되어 있는 Redux를 공부해야겠다는 생각을 했습니다.

<br />
