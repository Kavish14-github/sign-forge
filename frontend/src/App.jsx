import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'

const CreateSignature = lazy(() => import('./pages/CreateSignature'))
const SignDocument = lazy(() => import('./pages/SignDocument'))

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function LoadingScreen() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0F',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(108,99,255,0.15)',
            borderTopColor: '#6C63FF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#8888AA', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%', minHeight: '100vh' }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CreateSignature />} />
            <Route path="/sign" element={<SignDocument />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router basename={basename}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111118',
            color: '#E8E8FF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      <AnimatedRoutes />
    </Router>
  )
}

export default App
