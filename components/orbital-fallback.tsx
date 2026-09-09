'use client';
import { useEffect, useRef, useState } from 'react';
import type { Mission, Snapshot } from '@/lib/simulation/engine';

/** Interactive projected geometry for devices without WebGL. */
export default function OrbitalFallback({ mission, row, paused, view }: { mission: Mission; row: Snapshot; paused: boolean; view: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef({ mission, row, paused, view });
  const camera = useRef({ angle: 0.3, tilt: 0.45, zoom: 1 });
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { current.current = { mission, row, paused, view }; }, [mission, row, paused, view]);
  useEffect(() => {
    const el = canvas.current; if (!el) return;
    const ctx = el.getContext('2d'); if (!ctx) return;
    let frame = 0, time = 0, previous = 0, down = false, moved = false, px = 0, py = 0;
    let points: { x: number; y: number; id: number }[] = [];
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - previous < 33) return;
      const dt = Math.min((now - previous) / 1000, .05); previous = now;
      const state = current.current;
      if (!state.paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) time += dt;
      const w = el.clientWidth, h = el.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (el.width !== Math.round(w*dpr) || el.height !== Math.round(h*dpr)) { el.width = Math.round(w*dpr); el.height = Math.round(h*dpr); }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle='#01040a';ctx.fillRect(0,0,w,h);
      for(let i=0;i<220;i++){ctx.fillStyle=`rgba(190,215,245,${.15+(i%7)/12})`;ctx.fillRect(((i*7919)%1000)/1000*w,((i*3571)%1000)/1000*h,i%9===0?1.5:1,1);}
      const extent = state.view==='system'?1.3:Math.max(.58,state.mission.radiusAU*1.5);
      const scale=Math.min(w*.43,h*.48)/extent*camera.current.zoom;
      const tilt=state.view==='polar'?1:camera.current.tilt;
      const project=(x:number,y:number,z=0)=>{const a=camera.current.angle;return {x:w/2+(x*Math.cos(a)-y*Math.sin(a))*scale,y:h*.48+(x*Math.sin(a)+y*Math.cos(a))*scale*tilt-z*scale*.7};};
      const center=project(0,0); const sun=Math.max(18,Math.min(52,scale*.075));
      const glow=ctx.createRadialGradient(center.x,center.y,sun*.4,center.x,center.y,sun*3.7);glow.addColorStop(0,'#ffcf6b');glow.addColorStop(.24,'#ff951acc');glow.addColorStop(.48,'#b947193c');glow.addColorStop(1,'#ff800000');ctx.fillStyle=glow;ctx.fillRect(center.x-sun*4,center.y-sun*4,sun*8,sun*8);
      const solar=ctx.createRadialGradient(center.x-sun*.25,center.y-sun*.3,0,center.x,center.y,sun);solar.addColorStop(0,'#fff0b0');solar.addColorStop(.65,'#ffb32c');solar.addColorStop(1,'#cc5013');ctx.fillStyle=solar;ctx.beginPath();ctx.arc(center.x,center.y,sun,0,Math.PI*2);ctx.fill();
      for(let ring=0;ring<7;ring++){ctx.beginPath();for(let k=0;k<=120;k++){const a=k/120*Math.PI*2;const p=project(state.mission.radiusAU*Math.cos(a),state.mission.radiusAU*Math.sin(a),Math.sin(a+ring)*state.mission.radiusAU*(ring-3)*.12);if(k===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.strokeStyle='#bc99582e';ctx.lineWidth=1;ctx.stroke();}
      points=[];
      if(state.row.activeAreaM2>0)for(let i=0;i<500;i++){const ring=i%7,a=i*2.39996+time*.09/Math.pow(state.mission.radiusAU,.5),r=state.mission.radiusAU;const p=project(r*Math.cos(a),r*Math.sin(a),Math.sin(a+ring)*r*(ring-3)*.12);points.push({...p,id:i+1});ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a+camera.current.angle);ctx.fillStyle=i%5===0?'#e8c882':'#6d899b';ctx.fillRect(-3,-1.5,6,3);ctx.strokeStyle='#dbb777';ctx.lineWidth=.4;ctx.strokeRect(-3,-1.5,6,3);ctx.restore();}
      if(state.view==='system'){const earth=project(1,0);ctx.fillStyle='#58bce6';ctx.beginPath();ctx.arc(earth.x,earth.y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a8d4e4';ctx.font='12px sans-serif';ctx.fillText('EARTH',earth.x+12,earth.y+4);if(state.row.gridW>0){const p=project(state.mission.radiusAU,0);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(earth.x,earth.y);ctx.strokeStyle='#75d8ff80';ctx.stroke();}}
    };
    const onDown=(e:PointerEvent)=>{down=true;moved=false;px=e.clientX;py=e.clientY;el.setPointerCapture(e.pointerId);el.focus();};
    const onMove=(e:PointerEvent)=>{if(!down)return;const dx=e.clientX-px,dy=e.clientY-py;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;camera.current.angle+=dx*.008;camera.current.tilt=Math.max(.12,Math.min(1,camera.current.tilt+dy*.004));px=e.clientX;py=e.clientY;};
    const onUp=(e:PointerEvent)=>{down=false;if(!moved){const rect=el.getBoundingClientRect();const near=points.reduce<{id:number;d:number}|null>((best,p)=>{const d=Math.hypot(p.x-e.clientX+rect.left,p.y-e.clientY+rect.top);return d<18&&(!best||d<best.d)?{id:p.id,d}:best;},null);setSelected(near?.id??null);}};
    const wheel=(e:WheelEvent)=>{e.preventDefault();camera.current.zoom=Math.max(.45,Math.min(3,camera.current.zoom*Math.exp(-e.deltaY*.001)));};
    const key=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')camera.current.angle-=.1;if(e.key==='ArrowRight')camera.current.angle+=.1;if(e.key==='ArrowUp')camera.current.tilt=Math.min(1,camera.current.tilt+.08);if(e.key==='ArrowDown')camera.current.tilt=Math.max(.12,camera.current.tilt-.08);if(e.key==='+'||e.key==='=')camera.current.zoom=Math.min(3,camera.current.zoom*1.1);if(e.key==='-')camera.current.zoom=Math.max(.45,camera.current.zoom/1.1);if(e.key==='Home')camera.current={angle:.3,tilt:.45,zoom:1};};
    el.addEventListener('pointerdown',onDown);el.addEventListener('pointermove',onMove);el.addEventListener('pointerup',onUp);el.addEventListener('pointercancel',onUp);el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('keydown',key);frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);el.removeEventListener('pointerdown',onDown);el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerup',onUp);el.removeEventListener('pointercancel',onUp);el.removeEventListener('wheel',wheel);el.removeEventListener('keydown',key);};
  },[]);
  return <div className="orbital-fallback"><canvas ref={canvas} tabIndex={0} aria-label="Interactive solar swarm. Drag to rotate, scroll to zoom, click a collector to inspect. Arrow keys rotate; plus and minus zoom; Home resets." />{selected!==null&&<div className="collector-inspector"><strong>Representative collector {selected}</strong><span>Orbit {mission.radiusAU} AU · solar conversion {(mission.efficiency*100).toFixed(0)}%</span><button onClick={()=>setSelected(null)}>Close</button></div>}</div>;
}
