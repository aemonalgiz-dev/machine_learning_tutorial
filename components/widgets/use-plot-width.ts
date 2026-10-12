"use client";
import { useEffect, useRef, useState } from 'react';

// Match SVG coordinates to CSS pixels so chart labels remain readable on phones.
export function usePlotWidth(initial=640) {
  const ref=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(initial);
  useEffect(()=>{
    const element=ref.current;
    if(!element)return;
    const observer=new ResizeObserver(([entry])=>setWidth(Math.max(180,Math.round(entry.contentRect.width))));
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);
  return {ref,width};
}
