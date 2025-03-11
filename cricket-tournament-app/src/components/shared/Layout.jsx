import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Layout.module.css';

const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Cricket Tournament Auction & Management App</p>
      </footer>
    </div>
  );
};

export default Layout;