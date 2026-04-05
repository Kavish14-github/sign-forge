import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import CreateSignature from './pages/CreateSignature'
import SignDocument from './pages/SignDocument'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

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
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateSignature />} />
          <Route path="/sign" element={<SignDocument />} />
        </Routes>
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
