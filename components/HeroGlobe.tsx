// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { feature } from "topojson-client";
import * as THREE from "three";
import type { FeatureCollection } from "geojson";

type Countries = FeatureCollection<GeoJSON.Geometry, { name?: string }>;

export default function HeroGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<Countries | null>(null);
  const [size, setSize] = useState({ w: 500, h: 500 });

  const globeMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#F9FFF1") }),
    [],
  );

  useEffect(() => {
    fetch("/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const geo = feature(
          topo,
          topo.objects.countries,
        ) as unknown as Countries;
        setCountries(geo);
      });
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const update = () => {
      const s = Math.min(el.clientWidth, el.clientHeight);
      setSize({ w: s, h: s });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || !countries) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.enableZoom = false;
    controls.enablePan = false;
    g.pointOfView({ lat: 15, lng: -30, altitude: 2.3 }, 0);
  }, [countries]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-[600px] aspect-square mx-auto flex items-center justify-center"
    >
      <div className="absolute w-[70%] h-[70%] bg-[#d9ff00] rounded-full blur-[110px] opacity-20 pointer-events-none" />
      {/* Em mobile, pointer-events-none deixa o toque "atravessar" o globo
          e ir pra página, então o scroll vertical funciona normalmente.
          Em desktop (md+) o globo recebe interação normal. */}
      <div
        className="absolute inset-0 pointer-events-none md:pointer-events-auto flex items-center justify-center"
        style={{ touchAction: "pan-y" }}
      >
      {countries && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor="#d9ff00"
          atmosphereAltitude={0.22}
          showGraticules
          polygonsData={countries.features}
          polygonAltitude={0.008}
          polygonCapColor={() => "rgba(217, 255, 0, 0.18)"}
          polygonSideColor={() => "rgba(217, 255, 0, 0.08)"}
          polygonStrokeColor={() => "#9cb300"}
        />
      )}
      </div>
    </div>
  );
}
