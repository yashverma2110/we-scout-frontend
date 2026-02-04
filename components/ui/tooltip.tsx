'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
}

/**
 * TooltipProvider: Currently a pass-through to satisfy common UI patterns.
 */
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Tooltip: Uses a Portal to document.body to prevent clipping issues.
 * Calculates position based on the trigger element's bounding rect.
 */
export const Tooltip: React.FC<TooltipProps> = ({ children, content, delayDuration = 200 }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    // Clear any existing timeout before starting a new one to avoid double-triggers
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setOpen(true), delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  // Cleanup pending timeouts on component unmount to prevent state updates on destroyed components
  // and tooltips appearing "randomly" after the trigger is gone.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Re-calculate coordinates if the window is resized or scrolled
  // to ensure the portal stays attached to the trigger
  useEffect(() => {
    if (open) {
      window.addEventListener('resize', updateCoords);
      // Capture-phase scroll event to detect scrolling in any parent container
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  const tooltipPortal = open && createPortal(
    <div 
      className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{ 
        top: `${coords.top - 8}px`, 
        left: `${coords.left}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="bg-slate-900 text-slate-50 px-3 py-1.5 rounded-md text-[10px] font-medium shadow-md whitespace-nowrap border border-slate-800 relative">
        {content}
        {/* Pointer Arrow */}
        <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-800" />
      </div>
    </div>,
    document.body
  );

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {tooltipPortal}
    </div>
  );
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
