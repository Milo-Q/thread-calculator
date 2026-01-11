import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GarmentManagePage from './pages/GarmentManagePage';
import OrderManagePage from './pages/OrderManagePage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderEditPage from './pages/OrderEditPage';
import StatisticsPage from './pages/StatisticsPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <h1 className="navbar-brand">缝纫线计算器</h1>
          <div className="navbar-nav">
            <Link to="/" className="nav-link">订单计算</Link>
            <Link to="/orders" className="nav-link">订单管理</Link>
            <Link to="/statistics" className="nav-link">统计数据</Link>
            <Link to="/garments" className="nav-link">服装种类管理</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrderManagePage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/edit" element={<OrderEditPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/garments" element={<GarmentManagePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

