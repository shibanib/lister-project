'use client';

import React, { useState, KeyboardEvent, useCallback, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ListItemProps {
  id: string;
  content: string;
  completed: boolean;
  onChange: (content: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  number: number;
  bgColor: string;
  textColor: string;
  onFocus: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
  isActive: boolean;
  onEnterPress: (id: string) => void;
  onMoveItem?: (id: string, direction: 'up' | 'down') => void;
}

export default function ListItem({ 
  id, 
  content, 
  completed, 
  onChange, 
  onToggle,
  onDelete, 
  number,
  bgColor,
  textColor,
  onFocus,
  inputRef,
  isActive,
  onEnterPress,
  onMoveItem
}: ListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingCrayon, setIsDraggingCrayon] = useState(false);
  const [drawProgress, setDrawProgress] = useState(0);
  const [startX, setStartX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Delete') {
      onDelete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onEnterPress(id);
    } else if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && onMoveItem) {
      e.preventDefault();
      const direction = e.key === 'ArrowUp' ? 'up' : 'down';
      onMoveItem(id, direction);
    }
  };

  // Ensure content is always a string
  const safeContent = content ?? '';
  
  // Use callback to stabilize the ref
  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    if (inputRef) {
      inputRef(el);
    }
  }, [inputRef]);

  // Simple click handler to toggle completed state
  const handleCrayonClick = () => {
    onToggle();
  };

  // Handle crayon drag to cross out - Only for visual feedback, toggle on release
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.crayon-icon')) {
      e.preventDefault();
      setIsDraggingCrayon(true);
      setStartX(e.clientX);
      setDrawProgress(0);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingCrayon && textRef.current) {
      const textWidth = textRef.current.offsetWidth;
      const deltaX = e.clientX - startX;
      const progress = Math.min(Math.max((deltaX / textWidth) * 100, 0), 100);
      setDrawProgress(progress);
    }
  };
  
  const handleMouseUp = () => {
    if (isDraggingCrayon) {
      setIsDraggingCrayon(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // If dragged at least 30% across the text, toggle completed state
      if (drawProgress > 30) {
        onToggle();
      }
      
      // Reset draw progress
      setDrawProgress(0);
    }
  };

  const isEmpty = safeContent.trim() === '';
  const isDarkMode = textColor !== '#000000'; // Simple check to determine if in dark mode

  // Determine border and outline colors based on dark/light mode
  const borderColor = isDarkMode ? '#ffffff' : '#000000';
  
  return (
    <li 
      ref={setNodeRef} 
      style={{
        ...style,
        backgroundColor: bgColor,
        borderColor,
        opacity: completed ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out'
      }} 
      className={`neo-list-item flex items-center py-2 px-2 ${isActive ? 'active' : ''} ${completed ? 'completed-item' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className="mr-3 cursor-grab p-1 focus:outline-none"
        style={{ color: textColor }}
        {...attributes} 
        {...listeners}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      
      {!isEmpty && (
        <span className="mr-3 font-bold" style={{ 
          fontSize: '1.1rem', 
          transform: 'rotate(-1deg)',
          color: textColor 
        }}>
          {number}.
        </span>
      )}
      
      {isEmpty && <span className="mr-3 w-5"></span>}
      
      <div 
        ref={itemRef} 
        className="flex-grow flex items-center relative"
        onMouseDown={handleMouseDown}
      >
        <div ref={textRef} className="w-full relative">
          {/* Add a strikethrough overlay for completed items */}
          {completed && (
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div 
                className="w-full h-[3px]"
                style={{
                  backgroundColor: textColor,
                  opacity: 0.8
                }}
              ></div>
            </div>
          )}
          
          <input
            type="text"
            value={safeContent}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            ref={setInputRef}
            className={`w-full p-2 outline-none transition-all font-bold relative`}
            style={{
              backgroundColor: bgColor,
              border: 'none',
              color: textColor,
              position: 'relative',
              zIndex: 2
            }}
            placeholder={isEmpty ? "TYPE HERE (ENTER=NEW ITEM, SHIFT+ARROWS=MOVE)" : "LIST ITEM (SHIFT+ARROWS TO MOVE)"}
          />
          
          {isDraggingCrayon && !completed && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] z-1"
              style={{ 
                width: `${drawProgress}%`,
                opacity: drawProgress / 100 * 0.9,
                backgroundColor: textColor
              }}
            />
          )}
        </div>
        
        {(isHovered || isActive) && (
          <>
            {!isEmpty && (
              <div 
                className="crayon-icon cursor-pointer ml-2"
                style={{ color: textColor }}
                onClick={handleCrayonClick}
                title={completed ? "Remove strikethrough" : "Add strikethrough"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121l-11.646 11.647z"/>
                </svg>
              </div>
            )}
            
            <button 
              onClick={onDelete}
              className="ml-2 p-1 focus:outline-none"
              style={{ color: textColor }}
              aria-label="Delete item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </li>
  );
} 