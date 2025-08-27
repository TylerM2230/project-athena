import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './components/ThemeProvider';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-term-bg">
        <Navigation />
        <main className="max-w-5xl mx-auto px-8 py-12 animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;