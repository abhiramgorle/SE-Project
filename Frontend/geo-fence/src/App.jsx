import { useEffect, useState, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { MapLoadedContext } from 'context/MapLoadedContext';
import { defaultTheme } from 'theme/theme.styles';

const LandingPage = lazy(() => import('pages/landing-page/LandingPage'));

const router = createBrowserRouter([
  {
    index: true,
    element: <LandingPage />,
  },
]);

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className={defaultTheme}>
      <MapLoadedContext.Provider value={isMapLoaded}>
        <Suspense fallback={<></>}>
          <RouterProvider router={router} />
        </Suspense>
      </MapLoadedContext.Provider>
    </div>
  )
}

export default App
