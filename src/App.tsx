import React from 'react';
import './App.css';
import BlurText from './BlurText';

function App() {
  return (
    <div className="App">
      <header className="header">
        <BlurText
          text="Vide: aqui vai ser as músicas que vou te dedicar"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl font-bold text-pink-400 mb-8"
        />
      </header>
      {/* Aqui você pode adicionar o restante da sua página de músicas */}
    </div>
  );
}

export default App;
