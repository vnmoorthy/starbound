'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
export default function InteractiveConcept() {
  const host=useRef<HTMLButtonElement>(null);
  const drag=useRef<{x:number;y:number}|null>(null);
  const [view,setView]=useState({x:0,y:0,z:1.15});
  const bound=(v:{x:number;y:number;z:number})=>{const r=host.current?.getBoundingClientRect();const z=Math.max(1.05,Math.min(3,v.z));const mx=(r?.width??1000)*(z-1)/2,my=(r?.height??550)*(z-1)/2;return{x:Math.max(-mx,Math.min(mx,v.x)),y:Math.max(-my,Math.min(my,v.y)),z};};
  useEffect(()=>{const el=host.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();setView(v=>bound({...v,z:v.z*Math.exp(-e.deltaY*.001)}));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
  return <div className="swarm-cinematic interactive-concept"><button type="button" className="concept-pan-surface" ref={host} aria-label="Interactive Dyson swarm concept. Drag to pan, scroll to zoom. Arrow keys pan, plus and minus zoom, Home resets."
    onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.focus();}}
    onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;drag.current={x:e.clientX,y:e.clientY};setView(v=>bound({...v,x:v.x+dx,y:v.y+dy}));}}
    onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
    onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key))e.preventDefault();setView(v=>bound(e.key==='Home'?{x:0,y:0,z:1.15}:{...v,x:v.x+(e.key==='ArrowRight'?25:e.key==='ArrowLeft'?-25:0),y:v.y+(e.key==='ArrowDown'?25:e.key==='ArrowUp'?-25:0),z:v.z*(e.key==='+'||e.key==='='?1.15:e.key==='-'?1/1.15:1)}));}}>
    <Image src="/assets/dyson-swarm-hero.png" alt="Solar collectors surrounding the Sun" fill unoptimized priority sizes="100vw" draggable={false} style={{transform:`translate(${view.x}px, ${view.y}px) scale(${view.z})`}} />
    <div className="cinematic-title"><span>THE STARBOUND INITIATIVE</span><h2>A star.<br/>A million possibilities.</h2><p>Drag to explore the swarm. Scroll to move closer.</p></div>
    </button><div className="concept-zoom" onPointerDown={e=>e.stopPropagation()}><button aria-label="Zoom out" onClick={()=>setView(v=>bound({...v,z:v.z/1.2}))}>−</button><span>{Math.round(view.z*100)}%</span><button aria-label="Zoom in" onClick={()=>setView(v=>bound({...v,z:v.z*1.2}))}>+</button><button onClick={()=>setView({x:0,y:0,z:1.15})}>Reset view</button></div>
  </div>;
}
