import { useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { BitmapLayer, LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { MapView } from '@deck.gl/core';
import type { PickingInfo } from '@deck.gl/core';
import { Activity, CalendarDays, ChevronDown, Database, Download, Info, Layers3, Map, Minus, MousePointer2, Pause, Play, Plus, Search, Settings2, X } from 'lucide-react';
import { bounds, dates, displacement, makeRaster } from './data';

type Point = { lon: number; lat: number };
const initialView = { longitude: -116.8, latitude: 35.77, zoom: 9.7, pitch: 0, bearing: 0 };
const places = [
  { text: 'COSO JUNCTION', position: [-117.02, 36.00] }, { text: 'CHINA LAKE', position: [-117.02, 35.66] },
  { text: 'RIDGECREST', position: [-117.05, 35.61] }, { text: 'INYOKERN', position: [-117.03, 35.68] },
  { text: 'NAVAL AIR WEAPONS STATION', position: [-116.76, 35.67] }
];

export default function App() {
  const [frame, setFrame] = useState(37);
  const [playing, setPlaying] = useState(false);
  const [point, setPoint] = useState<Point>({ lon: -116.797, lat: 35.771 });
  const [view, setView] = useState(initialView);
  const [inspect, setInspect] = useState(true);
  const raster = useMemo(() => makeRaster(frame), [frame]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame(value => (value + 1) % dates.length), 300);
    return () => window.clearInterval(timer);
  }, [playing]);

  const grid = useMemo(() => {
    const lines = [];
    for (let lon = -117.2; lon <= -116.4; lon += .1) lines.push({ source: [lon, 35.4], target: [lon, 36.1] });
    for (let lat = 35.4; lat <= 36.1; lat += .1) lines.push({ source: [-117.2, lat], target: [-116.4, lat] });
    return lines;
  }, []);
  const layers = [
    new LineLayer({ id: 'grid', data: grid, getSourcePosition: d => d.source as [number, number], getTargetPosition: d => d.target as [number, number], getColor: [72, 101, 122, 55], getWidth: 1 }),
    new BitmapLayer({ id: 'displacement', image: raster, bounds, opacity: .94, pickable: true }),
    new TextLayer({ id: 'places', data: places, getPosition: d => d.position as [number, number], getText: d => d.text, getColor: [197, 215, 222, 180], getSize: d => d.text.length > 15 ? 10 : 11, fontWeight: 600, getTextAnchor: 'middle', getAlignmentBaseline: 'center', outlineColor: [4, 12, 21, 220], outlineWidth: 2 }),
    new ScatterplotLayer({ id: 'selected', data: [point], getPosition: d => [d.lon, d.lat], getRadius: 420, radiusUnits: 'meters', filled: true, getFillColor: [255, 255, 255, 35], stroked: true, getLineColor: [255, 255, 255, 240], lineWidthMinPixels: 2 }),
  ];
  const value = displacement(point.lon, point.lat, frame);
  const onClick = (info: PickingInfo) => info.coordinate && setPoint({ lon: info.coordinate[0], lat: info.coordinate[1] });

  return <main>
    <header className="topbar">
      <div className="brand"><div className="brandmark"><Activity size={18}/></div><b>DOLPHIN</b><span>InSAR Browser</span></div>
      <div className="dataset"><Database size={14}/><div><small>DATASET</small><strong>OPERA-S1 / California</strong></div><ChevronDown size={15}/></div>
      <div className="top-actions"><button><Search size={17}/><span>Search location</span><kbd>⌘ K</kbd></button><button className="icon"><Info size={18}/></button><button className="icon"><Settings2 size={18}/></button><button className="export"><Download size={15}/> Export</button></div>
    </header>
    <section className="workspace">
      <aside className="sidebar">
        <div className="side-title"><div><small>ACTIVE LAYER</small><h2>Line-of-sight displacement</h2></div><button><X size={16}/></button></div>
        <div className="field"><label><Layers3 size={14}/> Product</label><button className="select">Displacement time series <ChevronDown size={15}/></button></div>
        <div className="field"><label><CalendarDays size={14}/> Reference date</label><button className="select">15 Jan 2023 <ChevronDown size={15}/></button></div>
        <div className="field"><div className="labelrow"><label>Color scale</label><span>millimeters</span></div><div className="gradient"/><div className="ticks"><span>−50</span><span>−30</span><span>−10</span><span>10</span><span>20</span></div></div>
        <div className="field range"><div className="labelrow"><label>Opacity</label><b>94%</b></div><input type="range" value={94} readOnly /></div>
        <div className="field range"><div className="labelrow"><label>Coherence threshold</label><b>0.35</b></div><input type="range" value={35} readOnly /></div>
        <div className="meta"><div><span>48</span><small>ACQUISITIONS</small></div><div><span>24 days</span><small>REVISIT</small></div></div>
        <div className="zarr"><Database size={17}/><div><b>Zarr data cube</b><span>dolphin_timeseries.zarr</span></div><span className="ready">READY</span></div>
        <div className="sidebar-foot"><span>EPSG:4326</span><span>120 × 90 km</span><span>v0.29.1</span></div>
      </aside>
      <div className="map-wrap">
        <DeckGL views={new MapView({ repeat: true })} viewState={view} controller layers={layers} onClick={onClick} onViewStateChange={({viewState}) => setView(viewState as typeof initialView)} getCursor={() => 'crosshair'} />
        <div className="terrain"/>
        <div className="map-tools"><button onClick={() => setView(v => ({...v, zoom: v.zoom + 1}))}><Plus/></button><button onClick={() => setView(v => ({...v, zoom: v.zoom - 1}))}><Minus/></button><button><MousePointer2/></button></div>
        <button className="basemap"><Map size={15}/> Dark terrain <ChevronDown size={14}/></button>
        <div className="north">N<div>↑</div></div>
        {inspect && <div className="inspect" style={{left: '51%', top: '43%'}}><button onClick={() => setInspect(false)}><X size={13}/></button><small>DISPLACEMENT</small><strong>{value.toFixed(1)} <i>mm</i></strong><span>{dates[frame]}</span></div>}
        <div className="coordinates">{view.latitude.toFixed(4)}° N&nbsp;&nbsp; {Math.abs(view.longitude).toFixed(4)}° W <span>│</span> Zoom {view.zoom.toFixed(1)} <span>│</span> deck.gl</div>
      </div>
      <section className="timeline">
        <div className="chart-head"><div><Activity size={15}/><b>Point time series</b><span>{point.lat.toFixed(4)}° N, {Math.abs(point.lon).toFixed(4)}° W</span></div><button><Download size={14}/> CSV</button></div>
        <div className="chart"><svg viewBox="0 0 1000 108" preserveAspectRatio="none"><g className="chart-grid"><line x1="0" y1="16" x2="1000" y2="16"/><line x1="0" y1="54" x2="1000" y2="54"/><line x1="0" y1="92" x2="1000" y2="92"/></g><polyline points={dates.map((_,i) => `${i/(dates.length-1)*1000},${23-displacement(point.lon,point.lat,i)*1.34}`).join(' ')} /><line className="cursor" x1={frame/(dates.length-1)*1000} y1="4" x2={frame/(dates.length-1)*1000} y2="104"/><circle cx={frame/(dates.length-1)*1000} cy={23-value*1.34} r="5"/></svg><div className="ylabels"><span>0</span><span>−25</span><span>−50</span></div><div className="xlabels"><span>Jan 2023</span><span>Jul 2023</span><span>Jan 2024</span><span>Jul 2024</span><span>Jan 2025</span><span>Jul 2025</span><span>Feb 2026</span></div></div>
        <div className="player"><button className="play" onClick={() => setPlaying(!playing)}>{playing ? <Pause/> : <Play/>}</button><b>{dates[frame]}</b><input aria-label="Acquisition date" type="range" min="0" max={dates.length-1} value={frame} onChange={e => setFrame(Number(e.target.value))}/><span>{frame + 1} / {dates.length}</span></div>
      </section>
    </section>
  </main>;
}
