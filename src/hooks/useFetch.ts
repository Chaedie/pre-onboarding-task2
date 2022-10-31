import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { IssuesService } from '../apis/IssuesService';
import { Issue } from '../interfaces/Issue';

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

export default useFetch;
