import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import { getPublicSettings } from './utils/api'

export default function App() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    getPublicSettings()
      .then(r => setSettings(r.data || {}))
      .catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Navbar settings={settings} />
      <Routes>
        <Route path="/" element={<Home settings={settings} />} />
        <Route path="/urunler" element={<Products settings={settings} />} />
      </Routes>
      <Footer settings={settings} />
    </BrowserRouter>
  )
}
