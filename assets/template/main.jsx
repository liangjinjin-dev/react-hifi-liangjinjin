import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

// 最小 HashRouter 入口。复制本模板后：
// 1. npm install react react-dom react-router-dom zustand
// 2. 建 src/pages/Home.jsx（返回 <h1> 起步页）
// 3. 把 global.css / fonts 按结构放置
// 4. npm run dev 走查（移动视口 390×844）
export default function App(){
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
