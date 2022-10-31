import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { IssueContext } from './contexts/IssueContext';
import useFetch from './hooks/useFetch';
import { Issue } from './interfaces/Issue';
import Layout from './Layouts/Layout';
import DetailPage from './pages/DetailPage';
import IssuesPage from './pages/IssuesPage';

function App() {
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, errors] = useFetch(setIssueList, page);

  return (
    <BrowserRouter>
      <Routes>
        <IssueContext.Provider value={{ issueList, isLoading, errors }}>
          <Route
            path="/"
            element={
              <Layout>
                <IssuesPage setPage={setPage} />
              </Layout>
            }
          />
          <Route
            path="/:number"
            element={
              <Layout>
                <DetailPage />
              </Layout>
            }
          />
        </IssueContext.Provider>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
