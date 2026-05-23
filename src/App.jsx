import './App.css'
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';
import routerData from './routes';
import { Toaster } from 'sonner';
import { C } from './components/constants/data';

function App() {

    return (
        <AuthProvider>
            <AppContextProvider>
                <RouterProvider router={routerData} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: '10px',
                            background: `${C.teal}`,
                            color: 'black',
                            fontSize: '0.9rem',
                            fontFamily: 'Inter, sans-serif',
                        },
                    }}
                />
            </AppContextProvider>
        </AuthProvider>
    )
}

export default App
