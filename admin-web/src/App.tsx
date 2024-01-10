import { useState } from 'react'
import { Button } from "@/components/ui/button";

import ULogo from './assets/logos/uol-white.svg';

function App() {
  const [count, setCount] = useState(0)
  const [count2, setCount2] = useState(0)
  const [count3, setCount3] = useState(0);

  return (
    <>
      <img src={ULogo} alt="Lincoln Logo" />
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div className="card flex flex-row justify-between">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setCount2((count2) => count2 + 1)}
        >
          count is {count2}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCount3((count3) => count3 + 1)}
        >
          count is {count3}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App
