'use client';
import { useEffect, useRef, useState } from 'react';
import InteractiveConcept from './interactive-concept';
import OrbitalFallback from './orbital-fallback';
import { Button } from '@/components/ui/button';
import { type Mission, type Snapshot } from '@/lib/simulation/engine';
type View = 'swarm' | 'system' | 'polar';
/** Representative 3-D geometry. Orbits follow circular Kepler rates; no collision integration. */
export default function OrbitalScene({
  mission,
  row,
}: {
  mission: Mission;
  row: Snapshot;
}) {
  const mount = useRef<HTMLDivElement>(null),
    data = useRef({ mission, row }),
    viewRef = useRef<View>('swarm');
  const [view, setView] = useState<View>('swarm'),
    [mode, setMode] = useState<'concept' | 'live'>('concept'),
    [error, setError] = useState(''),
    [ready, setReady] = useState(false),
    [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    data.current = { mission, row };
  }, [mission, row]);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const host = mount.current;
    if (!host || mode !== 'live') return;
    setError('');
    setReady(false);
    let stopped = false,
      cleanup = () => {};
    Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/postprocessing/EffectComposer.js'),
      import('three/addons/postprocessing/RenderPass.js'),
      import('three/addons/postprocessing/UnrealBloomPass.js'),
    ])
      .then(
        ([
          T,
          { OrbitControls },
          { EffectComposer },
          { RenderPass },
          { UnrealBloomPass },
        ]) => {
          if (stopped) return;
          const renderer = new T.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.outputColorSpace = T.SRGBColorSpace;
          renderer.toneMapping = T.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 0.85;
          host.appendChild(renderer.domElement);
          renderer.domElement.setAttribute(
            'aria-label',
            'Interactive 3D solar swarm. Drag to rotate; scroll to zoom.',
          );
          const scene = new T.Scene();
          scene.background = new T.Color('#010205');
          const camera = new T.PerspectiveCamera(48, 1, 0.005, 70);
          camera.position.set(0.68, 0.38, 0.78);
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.065;
          controls.minDistance = 0.16;
          controls.maxDistance = 4;
          controls.enablePan = false;
          const composer = new EffectComposer(renderer);
          composer.addPass(new RenderPass(scene, camera));
          composer.addPass(
            new UnrealBloomPass(new T.Vector2(800, 500), 0.65, 0.55, 1.25),
          );
          const solarMaterial = new T.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
            fragmentShader: `uniform float time;varying vec3 vP;varying vec3 vN;varying vec3 vV;
   float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
   float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
   void main(){vec3 p=normalize(vP)*20.;float n=noise(p+time*.015);float gran=noise(p*8.+n*2.);float edge=pow(max(dot(vN,vV),0.),.42);vec3 c=mix(vec3(1.2,.18,.015),vec3(5.,2.45,.7),gran*.55+n*.45);float spots=smoothstep(.22,.38,noise(p*.4));c*=mix(.22,1.,spots);gl_FragColor=vec4(c*(.28+edge*.72),1.);}`,
          });
          const sun = new T.Mesh(
            new T.SphereGeometry(0.048, 80, 64),
            solarMaterial,
          );
          scene.add(sun);
          scene.add(new T.AmbientLight(0x688bb8, 0.65));
          const light = new T.PointLight(0xffecd3, 7, 0, 2);
          scene.add(light);
          const starPositions = [];
          for (let i = 0; i < 1700; i++) {
            const z = 2 * ((i * 0.61803398875) % 1) - 1,
              a = i * 2.399963,
              r = 9 + 4 * ((i * 0.41421356) % 1);
            starPositions.push(
              Math.sqrt(1 - z * z) * Math.cos(a) * r,
              z * r,
              Math.sqrt(1 - z * z) * Math.sin(a) * r,
            );
          }
          const starsG = new T.BufferGeometry();
          starsG.setAttribute(
            'position',
            new T.Float32BufferAttribute(starPositions, 3),
          );
          scene.add(
            new T.Points(
              starsG,
              new T.PointsMaterial({
                color: 0x94a8c5,
                size: 0.008,
                transparent: true,
                opacity: 0.65,
                sizeAttenuation: true,
              }),
            ),
          );
          const panelMat = new T.MeshStandardMaterial({
            color: 0x263f64,
            metalness: 0.8,
            roughness: 0.24,
            side: T.DoubleSide,
          });
          const rimMat = new T.MeshStandardMaterial({
            color: 0xbfb2a0,
            metalness: 0.85,
            roughness: 0.3,
          });
          const panelG = new T.PlaneGeometry(0.006, 0.0031),
            busG = new T.BoxGeometry(0.00065, 0.001, 0.0006);
          const panels = new T.InstancedMesh(panelG, panelMat, 2400),
            buses = new T.InstancedMesh(busG, rimMat, 2400);
          panels.instanceMatrix.setUsage(T.DynamicDrawUsage);
          buses.instanceMatrix.setUsage(T.DynamicDrawUsage);
          scene.add(panels, buses);
          const dummy = new T.Object3D(),
            origin = new T.Vector3();
          const orbitG = new T.BufferGeometry().setFromPoints(
            Array.from(
              { length: 257 },
              (_, i) =>
                new T.Vector3(
                  Math.cos((i / 256) * Math.PI * 2),
                  0,
                  Math.sin((i / 256) * Math.PI * 2),
                ),
            ),
          );
          const orbitMat = new T.LineBasicMaterial({
            color: 0x365064,
            transparent: true,
            opacity: 0.23,
          });
          const orbitLines = [0.3871, 1].map((radius) => {
            const l = new T.Line(orbitG, orbitMat);
            l.scale.setScalar(radius);
            scene.add(l);
            return l;
          });
          const ring = new T.Line(
            orbitG,
            new T.LineBasicMaterial({
              color: 0xb38956,
              transparent: true,
              opacity: 0.25,
            }),
          );
          scene.add(ring);
          const mercury = new T.Mesh(
            new T.SphereGeometry(0.008, 32, 24),
            new T.MeshStandardMaterial({ color: 0x85796c, roughness: 1 }),
          );
          mercury.position.set(0.3871, 0, 0);
          scene.add(mercury);
          const earth = new T.Mesh(
            new T.SphereGeometry(0.016, 40, 32),
            new T.MeshStandardMaterial({
              color: 0x498cca,
              roughness: 0.5,
              metalness: 0.15,
            }),
          );
          earth.position.set(1, 0, 0);
          scene.add(earth);
          const beamG = new T.BufferGeometry().setFromPoints([
            new T.Vector3(),
            new T.Vector3(1, 0, 0),
          ]);
          const beam = new T.Line(
            beamG,
            new T.LineBasicMaterial({
              color: 0x73c8ff,
              transparent: true,
              opacity: 0.5,
            }),
          );
          scene.add(beam);
          let frame = 0,
            last = 0,
            time = 0,
            currentView: View = 'swarm';
          const reduced = matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;
          const resize = () => {
            const w = host.clientWidth,
              h = host.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h);
            composer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          };
          const observer = new ResizeObserver(resize);
          observer.observe(host);
          resize();
          const draw = (stamp: number) => {
            if (stopped) return;
            frame = requestAnimationFrame(draw);
            if (stamp - last < 33) return;
            const dt = Math.min((stamp - last) / 1000, 0.06);
            last = stamp;
            if (!pausedRef.current && !reduced) time += dt;
            const { mission: m, row: r } = data.current;
            solarMaterial.uniforms.time.value = time;
            if (viewRef.current !== currentView) {
              currentView = viewRef.current;
              const positions = {
                swarm: [0.68, 0.38, 0.78],
                system: [1.4, 0.85, 1.5],
                polar: [0.01, 1.2, 0.01],
              };
              camera.position.fromArray(positions[currentView]);
              controls.target.set(0, 0, 0);
            }
            const count =
              r.activeKg <= 0
                ? 0
                : Math.min(
                    2400,
                    Math.max(
                      80,
                      Math.round(Math.log10(1 + r.activeAreaM2) * 270),
                    ),
                  );
            panels.count = count;
            buses.count = count;
            for (let i = 0; i < count; i++) {
              const inc = ((i % 23) / 22 - 0.5) * 1.5,
                node = ((i % 31) / 31) * Math.PI * 2,
                radius =
                  m.radiusAU * (0.965 + 0.07 * ((i * 0.61803398875) % 1));
              const a = i * 2.399963 + (time * 0.045) / Math.pow(radius, 1.5),
                x = Math.cos(a) * radius,
                z = Math.sin(a) * radius;
              dummy.position.set(
                Math.cos(node) * x - Math.sin(node) * z * Math.cos(inc),
                z * Math.sin(inc),
                Math.sin(node) * x + Math.cos(node) * z * Math.cos(inc),
              );
              dummy.lookAt(origin);
              dummy.updateMatrix();
              panels.setMatrixAt(i, dummy.matrix);
              buses.setMatrixAt(i, dummy.matrix);
            }
            panels.instanceMatrix.needsUpdate = true;
            buses.instanceMatrix.needsUpdate = true;
            ring.scale.setScalar(m.radiusAU);
            const a = (m.phaseDegrees * Math.PI) / 180;
            beamG.setFromPoints([
              new T.Vector3(
                m.radiusAU * Math.cos(a),
                0,
                m.radiusAU * Math.sin(a),
              ),
              earth.position,
            ]);
            beam.visible = m.linkMode !== 'space-only' && r.gridW > 0;
            orbitLines.forEach((l) => {
              l.visible = currentView === 'system';
            });
            controls.update();
            composer.render();
          };
          frame = requestAnimationFrame(draw);
          setReady(true);
          cleanup = () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            controls.dispose();
            composer.dispose();
            scene.traverse((o) => {
              if ('geometry' in o)
                (o.geometry as { dispose: () => void }).dispose();
              if ('material' in o) {
                const mats = Array.isArray(o.material)
                  ? o.material
                  : [o.material];
                mats.forEach((m: { dispose: () => void }) => m.dispose());
              }
            });
            renderer.dispose();
            renderer.domElement.remove();
          };
        },
      )
      .catch((e) => {
        if (!stopped)
          setError(
            e instanceof Error ? e.message : '3D rendering unavailable.',
          );
      });
    return () => {
      stopped = true;
      cleanup();
    };
  }, [mode]);
  return (
    <>
      {mode === 'concept' && <InteractiveConcept />}
      <div className="space-viewport" ref={mount} style={{ visibility: mode === 'live' && ready && !error ? 'visible' : 'hidden' }} />
      {mode === 'live' && (!ready || error) && <OrbitalFallback mission={mission} row={row} paused={paused} view={view} />}
      <div className="camera-controls">
        <Button variant="ghost" size="sm" className={mode === 'concept' ? 'selected' : ''} onClick={() => setMode('concept')}>Explore swarm</Button>
        <Button variant="ghost" size="sm" className={mode === 'live' ? 'selected' : ''} onClick={() => setMode('live')}>Live orbits</Button>
        {mode === 'live' && (['swarm', 'system', 'polar'] as View[]).map((v) => (
          <Button
            key={v}
            variant="ghost"
            size="sm"
            className={v === view ? 'selected' : ''}
            onClick={() => setView(v)}
          >
            {v}
          </Button>
        ))}
        {mode === 'live' && <Button variant="ghost" size="sm" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Animate' : 'Freeze view'}
        </Button>}
      </div>
      <div className="scene-scale">
        {mode === 'concept' ? 'Animated concept · illustrative orbital motion · live telemetry above' : `${error ? 'Interactive projected view' : 'Drag to orbit · scroll to zoom'} · representative collectors · sizes enlarged`}
      </div>
    </>
  );
}
