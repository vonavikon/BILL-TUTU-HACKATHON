import type { ReactNode } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { TripProvider } from './state/TripContext';
import Home from './pages/Home';
import TripPlan from './pages/TripPlan';

function TripScope({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  return <TripProvider key={id}>{children}</TripProvider>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/trip/:id"
        element={
          <TripScope>
            <TripPlan />
          </TripScope>
        }
      />
    </Routes>
  );
}
