import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ReportPage from './pages/ReportPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:code" element={<ReportPage />} />
        {/* Catch-all: show not-found via ReportPage with empty code */}
        <Route path="*" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  )
}
