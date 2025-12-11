import React, { Suspense } from 'react';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';
import { Loader } from '@react-three/drei';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-neutral-900 select-none">
      <Suspense fallback={null}>
        <GameScene />
      </Suspense>
      <UI />
      <Loader />
    </div>
  );
};

export default App;
