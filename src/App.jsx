import './App.css';
import Chatbot from './Chatbot'; // import the new component

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">Agnirakshak</div>
        <nav className="nav">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Rapid Fire Response 24/7</h1>
          <p>Trained professionals ready to protect lives and property at a moment's notice.</p>
        </div>
      </section>

      <button className="emergency-btn">🚨 Request Emergency Help</button>

      {/* Chatbot Component */}
      <Chatbot />

      <footer className="footer">
        <p>© 2025 Agnirakshak Fire Services. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
