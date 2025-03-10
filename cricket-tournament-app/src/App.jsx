

import './App.css'

import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/shared/Layout';

const App = () => {
  return (
    <Router>
      <Layout>
        {/* Your routes go here */}
      </Layout>
    </Router>
  );
};

  
export default App
