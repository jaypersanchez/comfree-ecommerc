import 'bootstrap/dist/css/bootstrap.min.css'
import Web3 from 'web3';
import './App.css';
import TopBar from './components/TopBar';
import PropertyList from './components/ProperList'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <TopBar />
      </header>
      <div>
        <PropertyList />
      </div>
    </div>
  );
}

export default App;
