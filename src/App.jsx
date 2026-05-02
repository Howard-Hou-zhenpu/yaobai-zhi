import { HashRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
import Auth from './pages/Auth';
import Index from './pages/Index';
import CreateDecision from './pages/CreateDecision';
import DecisionDetail from './pages/DecisionDetail';
import Review from './pages/Review';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div className="max-w-[375px] mx-auto min-h-screen bg-background relative">
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/create" element={<CreateDecision />} />
                    <Route path="/decision/:id" element={<DecisionDetail />} />
                    <Route path="/review" element={<Review />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </PageTransition>
                <BottomNav />
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </HashRouter>
  );
}
