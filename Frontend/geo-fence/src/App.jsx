import { useEffect, useState, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { MapLoadedContext } from 'context/MapLoadedContext';
import { defaultTheme } from 'theme/theme.styles';

const LandingPage = lazy(() => import('pages/landing-page/LandingPage'));
const SearchPage = lazy(() => import('pages/search-page/SearchPage'));

const router = createBrowserRouter([
  {
    index: true,
    element: <LandingPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
]);

const intervalMS = 60 * 60 * 1000; // periodically check sw for changes every 1 hr

const App = () => {
  const [isMapLoaded, setMapLoaded] = useState(false);

  useRegisterSW({
    onRegistered(sw) {
      if (sw) {
        setInterval(() => {
          sw.update();
        }, intervalMS);
      }
    },
  });

  useEffect(() => {
    window.initMap = () => setMapLoaded(true);
    const script = document.createElement('script');
    // load the maps script asynchronously and give reference to the global callback
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBu2Jhmm_WUtkZj9cRvTRG0Z71TsaljCDo&libraries=places,drawing,geometry&v=3&language=en&callback=initMap`;
    script.async = false;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className={defaultTheme}>
      <MapLoadedContext.Provider value={isMapLoaded}>
        <Suspense fallback={<></>}>
          <RouterProvider router={router} />
        </Suspense>
      </MapLoadedContext.Provider>
    </div>
  );
};

export default App;
