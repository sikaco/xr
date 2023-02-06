import { useEffect, useRef, useState } from "react";
import * as BABYLON from '@babylonjs/core';
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function OriginWelcomePage() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return <>
    <h1>Welcome to Tauri!</h1>

    <div className="row">
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" className="logo vite" alt="Vite logo" />
      </a>
      <a href="https://tauri.app" target="_blank">
        <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
      </a>
      <a href="https://reactjs.org" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
    </div>

    <p>Click on the Tauri, Vite, and React logos to learn more.</p>

    <div className="row">
      <div>
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="button" onClick={() => greet()}>
          Greet
        </button>
      </div>
    </div>
    <p>{greetMsg}</p>
  </>
}

function App() {
  const canvas = useRef(null)

  const createCamera = (scene: BABYLON.Scene) => {
    const alpha = Math.PI / 4
    const beta = Math.PI / 3
    const r = 8
    const target = new BABYLON.Vector3(0, 0, 0)

    const camera = new BABYLON.ArcRotateCamera('Camera', alpha, beta, r, target, scene)
    camera.attachControl(canvas, true)
  }

  const createBox = (scene: BABYLON.Scene) => {
    const box = BABYLON.MeshBuilder.CreateBox('box', {})
    box.position.x = 0.5
    box.position.y = 1

    const boxMaterial = new BABYLON.StandardMaterial('material', scene)
    boxMaterial.diffuseColor = BABYLON.Color3.Random()
    box.material = boxMaterial

    box.actionManager = new BABYLON.ActionManager(scene)
    box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (event) => {
      const sourceBox = event.meshUnderPointer
      if (!sourceBox) {
        return
      }

      // move the box upright
      sourceBox.position.x += 0.1
      sourceBox.position.y += 0.1

      // update the color
      boxMaterial.diffuseColor = BABYLON.Color3.Random()
    }))
  }

  const createScene = function (engine: BABYLON.Engine) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black().toColor4();
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    createCamera(scene)
    createBox(scene)

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 4, height: 4 });

    return scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground]
    }).then((xrExperience) => {
      console.log("Done, WebXR is enabled.");
      return scene;
    });
  }

  useEffect(() => {
    const engine = new BABYLON.Engine(canvas.current, true);

    createScene(engine).then(scene => {
      engine.runRenderLoop(() => scene.render());
    })


  }, [])

  return (
    <div className="container">
      <canvas id="renderCanvas" ref={canvas}></canvas>
      {/* <OriginWelcomePage /> */}
    </div>
  );
}

export default App;
