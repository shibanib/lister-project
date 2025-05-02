'use client';

import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import ListItem from './ListItem';
import StyleOptions from './StyleOptions';
import PixelConfetti from './PixelConfetti';
import RainingConfetti from './RainingConfetti';

type ListItem = {
  id: string;
  content: string;
  completed: boolean;
};

type StyleSettings = {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
};

const fontSamples = [
  { name: "Special Elite", className: "font-special-elite" },
  { name: "Saira", className: "font-saira" },
  { name: "Cormorant", className: "font-cormorant" },
  { name: "Barrio", className: "font-barrio" },
  { name: "Handwritten", className: "handwritten" },
];

// Color definitions for light/dark mode
const COLORS = {
  LIGHT: {
    WHITE: '#ffffff',
    SEPIA: '#f5f0e5',
    TEXT: '#000000',
    BORDER: '#000000',
    SHADOW: 'rgba(0, 0, 0, 0.5)'
  },
  DARK: {
    WHITE: '#1a1a1a',  // Dark gray instead of white
    SEPIA: '#2c2520',  // Dark brown instead of sepia
    TEXT: '#ffffff',   // White text
    TEXT_WHITE: '#ffffff', // White text option
    TEXT_SEPIA: '#f5f0e5', // Light sepia text option
    BORDER: '#ffffff', // White borders
    SHADOW: 'rgba(255, 255, 255, 0.5)'
  }
};

export default function ListMaker() {
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', content: 'First item in my list', completed: false },
    { id: '2', content: 'Something important to remember', completed: false },
    { id: '3', content: 'Completed task example', completed: true }
  ]);
  const [newItem, setNewItem] = useState('');
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    backgroundColor: COLORS.LIGHT.SEPIA, // Change default to sepia
    textColor: COLORS.LIGHT.TEXT,
    fontFamily: 'var(--font-saira)',
    fontSize: '16px'
  });
  const [showMenu, setShowMenu] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [showFonts, setShowFonts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  // New states for shuffle functionality
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [originalItems, setOriginalItems] = useState<ListItem[]>([]);
  const [hasShuffled, setHasShuffled] = useState(false);
  const shuffleConfirmRef = useRef<HTMLDivElement>(null);
  // New states for visit counter
  const [showVisitCounter, setShowVisitCounter] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const visitCounterRef = useRef<HTMLDivElement>(null);
  // Updated confetti state
  const [confettiType, setConfettiType] = useState<'pixel' | 'raining' | 'random'>('pixel');
  // New state for celebration menu
  const [showCelebrationMenu, setShowCelebrationMenu] = useState(false);
  const celebrationMenuRef = useRef<HTMLDivElement>(null);
  // Song reward state
  const [showSongReward, setShowSongReward] = useState(false);
  const [songRewardUrl, setSongRewardUrl] = useState<string | null>(null);
  const songRewardRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Load items from localStorage
    try {
      const savedItems = localStorage.getItem('list-items');
      const savedSettings = localStorage.getItem('style-settings');
      
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        // Validate items have the required properties
        if (Array.isArray(parsedItems) && parsedItems.every(item => 
          typeof item === 'object' && 
          'id' in item && 
          'content' in item &&
          'completed' in item
        )) {
          setItems(parsedItems);
        }
      }
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings === 'object' && 
            'backgroundColor' in parsedSettings &&
            'textColor' in parsedSettings &&
            'fontFamily' in parsedSettings &&
            'fontSize' in parsedSettings) {
          setStyleSettings(parsedSettings);
        }
      } else {
        // If no saved settings, update CSS variables with default sepia theme
        document.documentElement.style.setProperty('--background', COLORS.LIGHT.SEPIA);
        document.documentElement.style.setProperty('--foreground', COLORS.LIGHT.TEXT);
        document.documentElement.style.setProperty('--border-color', COLORS.LIGHT.BORDER);
        document.documentElement.style.setProperty('--shadow-color', COLORS.LIGHT.SHADOW);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Reset to default if there's an error
      localStorage.removeItem('list-items');
      localStorage.removeItem('style-settings');
      
      // Set default CSS variables to sepia theme
      document.documentElement.style.setProperty('--background', COLORS.LIGHT.SEPIA);
      document.documentElement.style.setProperty('--foreground', COLORS.LIGHT.TEXT);
      document.documentElement.style.setProperty('--border-color', COLORS.LIGHT.BORDER);
      document.documentElement.style.setProperty('--shadow-color', COLORS.LIGHT.SHADOW);
    }
  }, []);

  useEffect(() => {
    // Save items to localStorage whenever they change
    localStorage.setItem('list-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // Save style settings to localStorage whenever they change
    localStorage.setItem('style-settings', JSON.stringify(styleSettings));
  }, [styleSettings]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add keyboard navigation for the list
  useEffect(() => {
    function handleKeyboardNavigation(e: KeyboardEvent) {
      try {
        if (!activeItemId) return;
        
        const currentIndex = items.findIndex(item => item.id === activeItemId);
        if (currentIndex === -1) return;
        
        if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
          e.preventDefault();
          const nextItem = items[currentIndex + 1];
          setActiveItemId(nextItem.id);
          itemRefs.current[nextItem.id]?.focus();
        }
        
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          const prevItem = items[currentIndex - 1];
          setActiveItemId(prevItem.id);
          itemRefs.current[prevItem.id]?.focus();
        }
      } catch (error) {
        console.error('Error in keyboard navigation:', error);
      }
    }
    
    document.addEventListener('keydown', handleKeyboardNavigation as unknown as EventListener);
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation as unknown as EventListener);
    };
  }, [activeItemId, items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleAddItem = () => {
    if (items.length >= 100) {
      alert('Maximum 100 items allowed');
      return;
    }
    
    if (newItem.trim() !== '') {
      const newId = Date.now().toString();
      setItems([...items, { id: newId, content: newItem.trim(), completed: false }]);
      setNewItem('');
      
      // Focus on the newly added item after a brief delay to allow render
      setTimeout(() => {
        setActiveItemId(newId);
        itemRefs.current[newId]?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleItemChange = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content: content || '' } : item
    ));
  };

  const handleItemToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    const itemIndex = items.findIndex(item => item.id === id);
    
    // Find the next item to focus on
    let nextFocusId = null;
    if (items.length > 1) {
      if (itemIndex < items.length - 1) {
        nextFocusId = items[itemIndex + 1].id;
      } else if (itemIndex > 0) {
        nextFocusId = items[itemIndex - 1].id;
      }
    }
    
    setItems(items.filter(item => item.id !== id));
    
    // Set focus on the next appropriate item
    if (nextFocusId) {
      setTimeout(() => {
        setActiveItemId(nextFocusId);
        itemRefs.current[nextFocusId]?.focus();
      }, 10);
    }
  };

  // Handle Enter key press inside a list item - create a new item below it
  const handleEnterPress = (id: string) => {
    // Find the index of the current item
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    // Create a new empty item
    const newId = Date.now().toString();
    const newItem: ListItem = { 
      id: newId, 
      content: '', 
      completed: false 
    };
    
    // Insert the new item right after the current one
    const updatedItems = [...items];
    updatedItems.splice(currentIndex + 1, 0, newItem);
    setItems(updatedItems);
    
    // Focus the new item
    setTimeout(() => {
      setActiveItemId(newId);
      itemRefs.current[newId]?.focus();
    }, 10);
  };

  // Handle moving items up or down with Shift+Arrow keys
  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    // Can't move first item up or last item down
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === items.length - 1)
    ) {
      return;
    }
    
    // Create a new array and swap the items
    const updatedItems = [...items];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Use array move to maintain proper ordering
    setItems(arrayMove(updatedItems, currentIndex, targetIndex));
    
    // Keep focus on the moved item
    setTimeout(() => {
      setActiveItemId(id);
      itemRefs.current[id]?.focus();
    }, 10);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleItemFocus = (id: string) => {
    setActiveItemId(id);
  };

  const setFont = (fontFamily: string) => {
    setStyleSettings({...styleSettings, fontFamily});
    setShowFonts(false);
  };

  const updateColor = (newColor: string) => {
    // Create a monochromatic scheme based on the chosen color
    setStyleSettings({
      ...styleSettings,
      backgroundColor: newColor
    });
  };

  // Generate the list numbers, skipping empty items
  const generateItemNumbers = (items: ListItem[]) => {
    let counter = 1;
    const numberedItems = items.map((item, index) => {
      // If the item has content, assign it the next number, otherwise 0
      const number = item.content.trim() !== '' ? counter++ : 0;
      return { ...item, displayNumber: number };
    });
    return numberedItems;
  };

  const numberedItems = generateItemNumbers(items);

  // Convert list items to markdown
  const convertToMarkdown = () => {
    let markdown = "# THE LISTER\n\n";
    
    // Only include non-empty items in the markdown
    items.filter(item => item.content.trim() !== '').forEach((item, index) => {
      const prefix = (index + 1) + ". ";
      const content = item.content;
      
      // Add strikethrough for completed items
      if (item.completed) {
        markdown += `${prefix}~~${content}~~\n`;
      } else {
        markdown += `${prefix}${content}\n`;
      }
    });
    
    return markdown;
  };

  // Handle download as markdown
  const handleDownloadMarkdown = () => {
    const markdown = convertToMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-list.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload for markdown
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Parse markdown content and update list
  const parseMarkdown = (markdown: string) => {
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    const newItems: ListItem[] = [];
    
    // Parse each line as a list item
    lines.forEach(line => {
      // Skip headers and non-list items
      if (line.startsWith('#') || (!line.match(/^\d+\.\s/) && !line.match(/^-\s/))) {
        return;
      }
      
      // Remove list markers (1. or -) and trim
      let content = line.replace(/^\d+\.\s+/, '').replace(/^-\s+/, '').trim();
      
      // Check for strikethrough ~~text~~
      const isCompleted = content.match(/^~~(.+)~~$/) !== null;
      if (isCompleted) {
        content = content.replace(/^~~(.+)~~$/, '$1');
      }
      
      newItems.push({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        content,
        completed: isCompleted
      });
    });
    
    if (newItems.length > 0) {
      setItems(newItems);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseMarkdown(content);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  // Close instructions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (instructionsRef.current && !instructionsRef.current.contains(event.target as Node)) {
        setShowInstructions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the current color theme based on dark mode
  const getThemeColors = () => {
    return darkMode ? COLORS.DARK : COLORS.LIGHT;
  };

  // Update colors when dark mode changes
  useEffect(() => {
    const themeColors = getThemeColors();
    const currentBg = styleSettings.backgroundColor;
    
    // Find corresponding color in the new theme
    let newBg;
    if (currentBg === COLORS.LIGHT.WHITE || currentBg === COLORS.DARK.WHITE) {
      newBg = themeColors.WHITE;
    } else {
      newBg = themeColors.SEPIA; // Default to sepia in both modes
    }
    
    // If switching to dark mode, set text to white; if switching to light mode, set to black
    const newTextColor = darkMode 
      ? (styleSettings.textColor === COLORS.LIGHT.TEXT ? COLORS.DARK.TEXT_WHITE : styleSettings.textColor)
      : COLORS.LIGHT.TEXT;
    
    setStyleSettings({
      ...styleSettings,
      backgroundColor: newBg,
      textColor: newTextColor
    });
    
    // Update CSS variables for global styling
    document.documentElement.style.setProperty('--background', newBg);
    document.documentElement.style.setProperty('--foreground', themeColors.TEXT);
    document.documentElement.style.setProperty('--border-color', themeColors.BORDER);
    document.documentElement.style.setProperty('--shadow-color', themeColors.SHADOW);
    
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Close shuffle confirmation when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shuffleConfirmRef.current && !shuffleConfirmRef.current.contains(event.target as Node)) {
        setShowShuffleConfirm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle shuffle confirmation
  const handleShuffleClick = () => {
    if (!hasShuffled) {
      setShowShuffleConfirm(true);
    } else {
      // Execute shuffle if already shuffled once
      executeShuffleItems();
    }
  };

  // Execute the shuffle action
  const executeShuffleItems = () => {
    // Store original order if not shuffled yet
    if (!hasShuffled) {
      setOriginalItems([...items]);
    }
    
    // Fisher-Yates shuffle algorithm
    const shuffledItems = [...items];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
    }
    
    setItems(shuffledItems);
    setShowShuffleConfirm(false);
    setHasShuffled(true);
  };

  // Revert to original order
  const revertToOriginalOrder = () => {
    if (originalItems.length > 0) {
      setItems([...originalItems]);
      setHasShuffled(false);
    }
  };

  // Reset shuffle state when adding a new item
  useEffect(() => {
    if (hasShuffled) {
      setHasShuffled(false);
      setOriginalItems([]);
    }
  }, [items.length]);

  // Track visits using localStorage
  useEffect(() => {
    try {
      // Get current visit count
      const savedVisits = localStorage.getItem('lister-visit-count');
      let currentVisits = savedVisits ? parseInt(savedVisits, 10) : 0;
      
      // Increment for this visit
      currentVisits += 1;
      
      // Save back to localStorage
      localStorage.setItem('lister-visit-count', currentVisits.toString());
      
      // Update state
      setVisitCount(currentVisits);
    } catch (error) {
      console.error('Error tracking visits:', error);
    }
  }, []);

  // Close visit counter when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (visitCounterRef.current && !visitCounterRef.current.contains(event.target as Node)) {
        setShowVisitCounter(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle visit counter display
  const toggleVisitCounter = () => {
    setShowVisitCounter(!showVisitCounter);
  };

  // Check if all tasks are completed
  const allTasksCompleted = () => {
    const nonEmptyTasks = items.filter(item => item.content.trim() !== '');
    return nonEmptyTasks.length > 0 && nonEmptyTasks.every(item => item.completed);
  };

  // Toggle confetti type
  const toggleConfettiType = (type: 'pixel' | 'raining' | 'random') => {
    setConfettiType(type);
    setShowCelebrationMenu(false);
  };

  // Toggle celebration menu
  const toggleCelebrationMenu = () => {
    setShowCelebrationMenu(!showCelebrationMenu);
  };

  // Get random song reward
  const getRandomSongReward = () => {
    // Playlist: https://youtube.com/playlist?list=PL_OTW5FTd4IDwkg_Zm-rthOmlivUN-Gf8
    // Instead of making API calls, we store the video IDs from the playlist
    // This can be updated manually when new songs are added to the playlist
    const playlistVideoIds = [
      'dQw4w9WgXcQ', // Never Gonna Give You Up
      'djV11Xbc914', // Take On Me
      'ZbZSe6N_BXs', // Happy
      'pRpeEdMmmQ0', // Here Comes the Sun
      'y6120QOlsfU', // Sandstorm
      'L_jWHffIx5E', // All Star
      'fJ9rUzIMcZQ', // Bohemian Rhapsody
      'btPJPFnesV4', // Eye of the Tiger
      'FTQbiNvZqaY', // Toto - Africa
      'kffacxfA7G4', // Baby
      'PWgvGjAhvmw', // Hey Ya!
      '3GwjfUFyY6M', // Celebration
      '8SbUC-UaAxE', // Sweet Child O' Mine
      '9bZkp7q19f0', // Gangnam Style
      '5GL9JoH4Sws'  // I'm Still Standing
    ];
    
    // Get a random video ID from the array
    const randomVideoId = playlistVideoIds[Math.floor(Math.random() * playlistVideoIds.length)];
    
    // Construct the YouTube URL
    return `https://youtu.be/${randomVideoId}`;
  };

  // Close celebration menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (celebrationMenuRef.current && !celebrationMenuRef.current.contains(event.target as Node)) {
        setShowCelebrationMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close song reward dialog when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (songRewardRef.current && !songRewardRef.current.contains(event.target as Node)) {
        setShowSongReward(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for all tasks completed and show song reward if appropriate
  useEffect(() => {
    // Only proceed if all tasks are completed and confetti type is random
    if (allTasksCompleted() && confettiType === 'random' && !showSongReward) {
      // 50% chance of getting a song reward
      if (Math.random() > 0.5) {
        const randomSong = getRandomSongReward();
        setSongRewardUrl(randomSong);
        
        // Show the reward after a short delay to allow confetti to display first
        const rewardTimer = setTimeout(() => {
          setShowSongReward(true);
        }, 1500);
        
        return () => clearTimeout(rewardTimer);
      }
    }
  }, [allTasksCompleted(), confettiType]);

  return (
    <div 
      className="min-h-screen px-4 md:px-8 py-12 pb-36 md:pb-24 relative" 
      style={{ 
        backgroundColor: styleSettings.backgroundColor,
        color: styleSettings.textColor,
        fontFamily: styleSettings.fontFamily,
        fontSize: styleSettings.fontSize
      }}
    >
      {/* Confetti - shows when all tasks are completed */}
      {confettiType === 'pixel' && (
        <PixelConfetti show={allTasksCompleted()} darkMode={darkMode} />
      )}
      {confettiType === 'raining' && (
        <RainingConfetti show={allTasksCompleted()} darkMode={darkMode} />
      )}
      {confettiType === 'random' && (
        Math.random() > 0.5 ? 
          <PixelConfetti show={allTasksCompleted()} darkMode={darkMode} /> : 
          <RainingConfetti show={allTasksCompleted()} darkMode={darkMode} />
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl mb-4 inline-block" 
              style={{ 
                transform: 'rotate(-2deg)', 
                fontFamily: styleSettings.fontFamily 
              }}>
            THE LISTER
          </h1>
        </div>

        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={toggleMenu}
            className="btn-outline uppercase font-bold"
            style={{ fontFamily: styleSettings.fontFamily }}
          >
            Settings
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold p-2" 
                  style={{ 
                    border: '3px solid var(--foreground)', 
                    transform: 'rotate(1deg)',
                    fontFamily: styleSettings.fontFamily 
                  }}>
              {items.filter(item => item.completed).length}/{items.filter(item => item.content.trim() !== '').length} completed
            </span>
          </div>
        </div>

        {/* Hidden menu panel */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute left-1/2 transform -translate-x-1/2 w-80 neo-settings-panel z-10 bottom-40 md:bottom-auto md:top-[20%]"
            style={{ 
              backgroundColor: styleSettings.backgroundColor,
              borderColor: darkMode ? '#ffffff' : '#000000'
            }}
          >
            <div className="p-6">
              <h3 className="text-base font-bold mb-6 uppercase"
                  style={{ 
                    fontFamily: styleSettings.fontFamily,
                    color: styleSettings.textColor
                  }}>
                Theme Settings
              </h3>
              <StyleOptions 
                styleSettings={styleSettings} 
                setStyleSettings={setStyleSettings} 
                updateMonochromeColor={updateColor}
                isDarkMode={darkMode}
              />
            </div>
          </div>
        )}

        <div className="mb-10">
          <div className="flex neo-input" style={{ backgroundColor: styleSettings.backgroundColor }}>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow p-2 border-0 focus:outline-none font-bold"
              placeholder="Add a new task to your list..."
              style={{ 
                fontFamily: styleSettings.fontFamily,
                backgroundColor: styleSettings.backgroundColor
              }}
            />
            <button 
              onClick={handleAddItem}
              className="px-6 py-2 font-bold bg-black text-white hover:bg-gray-800"
              style={{ 
                marginRight: '-1rem',
                fontFamily: styleSettings.fontFamily 
              }}
            >
              ADD
            </button>
          </div>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3 mb-10">
              {items.map((item, index) => {
                const isContentEmpty = item.content.trim() === '';
                return (
                  <ListItem 
                    key={item.id} 
                    id={item.id}
                    content={item.content || ''}
                    completed={item.completed || false}
                    onChange={(content: string) => handleItemChange(item.id, content)}
                    onToggle={() => handleItemToggle(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                    number={numberedItems[index].displayNumber}
                    bgColor={styleSettings.backgroundColor}
                    textColor={styleSettings.textColor}
                    onFocus={() => handleItemFocus(item.id)}
                    inputRef={(el) => { itemRefs.current[item.id] = el; }}
                    isActive={activeItemId === item.id}
                    onEnterPress={handleEnterPress}
                    onMoveItem={handleMoveItem}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pixel Art Style Icons in Bottom Right */}
      <div 
        className="fixed bottom-0 max-w-full flex flex-row justify-center w-full px-4 gap-2 py-4 md:py-0 md:w-auto md:right-6 md:bottom-6 md:flex-col md:gap-4 md:px-0"
        style={{ 
          backgroundColor: `${darkMode ? 'rgba(26, 26, 26, 0.9)' : 'rgba(245, 240, 229, 0.9)'}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 -2px 10px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderTop: `3px solid ${darkMode ? '#ffffff' : '#000000'}`
        }}
      >
        {/* Dark Mode Toggle - Pixel Art Style */}
        <button 
          onClick={toggleDarkMode} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="pixel-art-icon">
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-sun">
                <rect x="8" y="1" width="4" height="4" fill="white" />
                <rect x="8" y="15" width="4" height="4" fill="white" />
                <rect x="15" y="8" width="4" height="4" fill="white" />
                <rect x="1" y="8" width="4" height="4" fill="white" />
                <rect x="6" y="6" width="8" height="8" fill="white" />
                <rect x="13" y="3" width="4" height="4" fill="white" />
                <rect x="3" y="3" width="4" height="4" fill="white" />
                <rect x="13" y="13" width="4" height="4" fill="white" />
                <rect x="3" y="13" width="4" height="4" fill="white" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-moon">
                <rect x="6" y="2" width="12" height="16" fill="white" />
                <rect x="2" y="6" width="4" height="8" fill="white" />
                <rect x="10" y="6" width="4" height="4" fill="black" />
                <rect x="6" y="2" width="4" height="4" fill="black" />
                <rect x="14" y="6" width="4" height="4" fill="black" />
                <rect x="14" y="14" width="4" height="4" fill="black" />
              </svg>
            )}
          </div>
        </button>
        
        {/* Celebration Menu Toggle - Pixel Art Style */}
        <button 
          onClick={toggleCelebrationMenu} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title="Celebration Settings"
        >
          <div className="pixel-art-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-celebration">
              <rect x="10" y="2" width="2" height="2" fill="white" />
              <rect x="8" y="4" width="6" height="2" fill="white" />
              <rect x="6" y="6" width="10" height="2" fill="white" />
              <rect x="4" y="8" width="14" height="2" fill="white" />
              <rect x="6" y="10" width="10" height="2" fill="white" />
              <rect x="8" y="12" width="6" height="2" fill="white" />
              <rect x="10" y="14" width="2" height="2" fill="white" />
              <rect x="4" y="16" width="14" height="2" fill="white" />
            </svg>
          </div>
        </button>
        
        {/* Visit Counter - Pixel Art Style */}
        <button 
          onClick={toggleVisitCounter} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title="View Visit Count"
        >
          <div className="pixel-art-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-counter">
              <rect x="2" y="2" width="16" height="16" fill="white" />
              <rect x="6" y="6" width="2" height="8" fill="black" />
              <rect x="12" y="6" width="2" height="8" fill="black" />
              <rect x="6" y="6" width="8" height="2" fill="black" />
              <rect x="6" y="12" width="8" height="2" fill="black" />
            </svg>
          </div>
        </button>
        
        {/* Shuffle Icon - Pixel Art Style */}
        <button 
          onClick={handleShuffleClick} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title={hasShuffled ? "Shuffle Again" : "Shuffle Tasks"}
        >
          <div className="pixel-art-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-shuffle">
              <rect x="2" y="4" width="16" height="4" fill="white" />
              <rect x="14" y="2" width="4" height="4" fill="white" />
              <rect x="2" y="12" width="16" height="4" fill="white" />
              <rect x="2" y="10" width="4" height="4" fill="white" />
            </svg>
          </div>
        </button>
        
        {/* Revert Shuffle Button - Only show if recently shuffled */}
        {hasShuffled && (
          <button 
            onClick={revertToOriginalOrder} 
            className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
            title="Revert to Original Order"
          >
            <div className="pixel-art-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-revert">
                <rect x="6" y="2" width="8" height="4" fill="white" />
                <rect x="2" y="6" width="4" height="12" fill="white" />
                <rect x="14" y="6" width="4" height="12" fill="white" />
                <rect x="6" y="14" width="8" height="4" fill="white" />
                <rect x="6" y="6" width="8" height="2" fill="white" />
              </svg>
            </div>
          </button>
        )}
        
        {/* Help Icon */}
        <button 
          onClick={() => setShowInstructions(!showInstructions)} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title="Help & Instructions"
        >
          <div className="pixel-art-icon question-mark">?</div>
        </button>
        
        {/* Download Icon */}
        <button 
          onClick={handleDownloadMarkdown} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title="Download as Markdown"
        >
          <div className="pixel-art-icon down-arrow">↓</div>
        </button>
        
        {/* Upload Icon */}
        <button 
          onClick={handleUploadClick} 
          className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center pixel-art-btn"
          title="Upload Markdown List"
        >
          <div className="pixel-art-icon up-arrow">↑</div>
        </button>
        
        {/* Hidden file input for upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".md, .txt" 
          className="hidden" 
        />
      </div>

      {/* Visit Counter Panel */}
      {showVisitCounter && (
        <div 
          ref={visitCounterRef}
          className="fixed bottom-40 right-1/2 translate-x-1/2 w-80 neo-settings-panel z-20 p-6 md:bottom-24 md:right-24 md:translate-x-0"
          style={{ 
            backgroundColor: styleSettings.backgroundColor,
            borderColor: darkMode ? '#ffffff' : '#000000',
            color: styleSettings.textColor
          }}
        >
          <h3 className="text-base font-bold mb-4 uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Visit Counter
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold">Your Visits:</span>
              <div className="text-4xl font-bold text-center mt-2 p-2 border-3" 
                   style={{ borderColor: darkMode ? '#ffffff' : '#000000' }}>
                {visitCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shuffle Confirmation Panel */}
      {showShuffleConfirm && (
        <div 
          ref={shuffleConfirmRef}
          className="fixed bottom-40 right-1/2 translate-x-1/2 w-80 neo-settings-panel z-20 p-6 md:bottom-24 md:right-24 md:translate-x-0"
          style={{ 
            backgroundColor: styleSettings.backgroundColor,
            borderColor: darkMode ? '#ffffff' : '#000000',
            color: styleSettings.textColor
          }}
        >
          <h3 className="text-base font-bold mb-4 uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Shuffle Confirmation
          </h3>
          <p className="text-sm mb-4">
            Are you sure you want to shuffle your tasks? (Recommended for task inertia / pro A(u)DHD procrastinators)
          </p>
          <div className="flex justify-between">
            <button 
              onClick={() => setShowShuffleConfirm(false)}
              className="px-4 py-2 border-3 font-bold"
              style={{ 
                borderColor: darkMode ? '#ffffff' : '#000000',
                fontFamily: styleSettings.fontFamily
              }}
            >
              No
            </button>
            <button 
              onClick={executeShuffleItems}
              className="px-4 py-2 bg-black text-white font-bold"
              style={{ fontFamily: styleSettings.fontFamily }}
            >
              Yes
            </button>
          </div>
        </div>
      )}

      {/* Celebration Menu Panel */}
      {showCelebrationMenu && (
        <div 
          ref={celebrationMenuRef}
          className="fixed bottom-40 right-1/2 translate-x-1/2 w-80 neo-settings-panel z-20 p-6 md:bottom-24 md:right-24 md:translate-x-0"
          style={{ 
            backgroundColor: styleSettings.backgroundColor,
            borderColor: darkMode ? '#ffffff' : '#000000',
            color: styleSettings.textColor
          }}
        >
          <h3 className="text-base font-bold mb-4 uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Celebration Settings
          </h3>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => toggleConfettiType('pixel')}
              className={`px-4 py-2 border-3 font-bold flex items-center ${confettiType === 'pixel' ? 'bg-black text-white' : ''}`}
              style={{ 
                borderColor: darkMode ? '#ffffff' : '#000000',
                fontFamily: styleSettings.fontFamily
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="4" height="4" fill="currentColor" />
                <rect x="12" y="4" width="4" height="4" fill="currentColor" />
                <rect x="8" y="8" width="4" height="4" fill="currentColor" />
                <rect x="4" y="12" width="4" height="4" fill="currentColor" />
                <rect x="12" y="12" width="4" height="4" fill="currentColor" />
              </svg>
              Pixel Fireworks
            </button>
            <button 
              onClick={() => toggleConfettiType('raining')}
              className={`px-4 py-2 border-3 font-bold flex items-center ${confettiType === 'raining' ? 'bg-black text-white' : ''}`}
              style={{ 
                borderColor: darkMode ? '#ffffff' : '#000000',
                fontFamily: styleSettings.fontFamily
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="2" width="2" height="2" fill="currentColor" />
                <rect x="10" y="2" width="2" height="2" fill="currentColor" />
                <rect x="16" y="2" width="2" height="2" fill="currentColor" />
                <rect x="2" y="6" width="2" height="2" fill="currentColor" />
                <rect x="8" y="6" width="2" height="2" fill="currentColor" />
                <rect x="14" y="6" width="2" height="2" fill="currentColor" />
                <rect x="6" y="10" width="2" height="2" fill="currentColor" />
                <rect x="12" y="10" width="2" height="2" fill="currentColor" />
                <rect x="4" y="14" width="2" height="2" fill="currentColor" />
                <rect x="10" y="14" width="2" height="2" fill="currentColor" />
                <rect x="16" y="14" width="2" height="2" fill="currentColor" />
              </svg>
              Raining Confetti
            </button>
            <button 
              onClick={() => toggleConfettiType('random')}
              className={`px-4 py-2 border-3 font-bold flex items-center ${confettiType === 'random' ? 'bg-black text-white' : ''}`}
              style={{ 
                borderColor: darkMode ? '#ffffff' : '#000000',
                fontFamily: styleSettings.fontFamily
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="2" height="2" fill="currentColor" />
                <rect x="8" y="4" width="2" height="2" fill="currentColor" />
                <rect x="14" y="4" width="2" height="2" fill="currentColor" />
                <rect x="6" y="8" width="2" height="2" fill="currentColor" />
                <rect x="12" y="8" width="2" height="2" fill="currentColor" />
                <rect x="10" y="12" width="2" height="2" fill="currentColor" />
                <rect x="16" y="12" width="2" height="2" fill="currentColor" />
                <rect x="4" y="16" width="2" height="2" fill="currentColor" />
                <rect x="12" y="16" width="2" height="2" fill="currentColor" />
              </svg>
              Random Mode + Song Gift
            </button>
            
            <div className="text-sm mt-2 pt-4 border-t-2" style={{ borderColor: darkMode ? '#ffffff' : '#000000' }}>
              <p>Select Random Mode for a chance to get a song reward when you complete all tasks!</p>
            </div>
          </div>
        </div>
      )}

      {/* Song Reward Dialog */}
      {showSongReward && songRewardUrl && (
        <div 
          ref={songRewardRef}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 neo-settings-panel z-50 p-6"
          style={{ 
            backgroundColor: styleSettings.backgroundColor,
            borderColor: darkMode ? '#ffffff' : '#000000',
            color: styleSettings.textColor,
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
            border: `3px solid ${darkMode ? '#ffffff' : '#000000'}`
          }}
        >
          <div className="text-center mb-4">
            <svg className="inline-block w-8 h-8" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="2" width="8" height="2" fill="currentColor" />
              <rect x="6" y="16" width="8" height="2" fill="currentColor" />
              <rect x="2" y="6" width="2" height="8" fill="currentColor" />
              <rect x="16" y="6" width="2" height="8" fill="currentColor" />
              <rect x="6" y="6" width="8" height="8" fill="currentColor" />
              <rect x="4" y="4" width="2" height="2" fill="currentColor" />
              <rect x="14" y="4" width="2" height="2" fill="currentColor" />
              <rect x="4" y="14" width="2" height="2" fill="currentColor" />
              <rect x="14" y="14" width="2" height="2" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-base font-bold mb-2 text-center uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Congratulations!
          </h3>
          <p className="text-center mb-4">
            You've completed all your tasks! Here's a song reward for your hard work.
          </p>
          <div className="flex justify-center mt-4">
            <a 
              href={songRewardUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white font-bold inline-flex items-center"
              style={{ fontFamily: styleSettings.fontFamily }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="2" width="2" height="12" fill="white" />
                <rect x="13" y="6" width="2" height="8" fill="white" />
                <rect x="5" y="8" width="2" height="6" fill="white" />
                <rect x="5" y="14" width="10" height="2" fill="white" />
              </svg>
              Open Song
            </a>
          </div>
          <button 
            onClick={() => setShowSongReward(false)}
            className="absolute top-2 right-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Instructions Panel */}
      {showInstructions && (
        <div 
          ref={instructionsRef}
          className="fixed bottom-40 right-1/2 translate-x-1/2 w-80 neo-settings-panel z-20 p-6 md:bottom-24 md:right-24 md:translate-x-0"
          style={{ 
            backgroundColor: styleSettings.backgroundColor,
            borderColor: darkMode ? '#ffffff' : '#000000',
            color: styleSettings.textColor
          }}
        >
          <h3 className="text-base font-bold mb-4 uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Keyboard Shortcuts
          </h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Enter:</strong> Create a new item below current one</li>
            <li><strong>Delete:</strong> Remove the current item</li>
            <li><strong>Shift + ↑/↓:</strong> Move item up/down</li>
          </ul>
          <h3 className="text-base font-bold mt-4 mb-2 uppercase"
              style={{ fontFamily: styleSettings.fontFamily }}>
            Actions
          </h3>
          <ul className="space-y-2 text-sm">
            <li><strong>
              <svg width="12" height="12" viewBox="0 0 20 20" className="inline-block mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="2" width="12" height="16" fill="currentColor" />
                <rect x="2" y="6" width="4" height="8" fill="currentColor" />
                <rect x="10" y="6" width="4" height="4" fill={darkMode ? 'black' : 'white'} />
                <rect x="6" y="2" width="4" height="4" fill={darkMode ? 'black' : 'white'} />
                <rect x="14" y="6" width="4" height="4" fill={darkMode ? 'black' : 'white'} />
                <rect x="14" y="14" width="4" height="4" fill={darkMode ? 'black' : 'white'} />
              </svg>
            </strong> Toggle dark/light mode</li>
            <li><strong>
              <svg width="12" height="12" viewBox="0 0 20 20" className="inline-block mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="2" width="2" height="2" fill="currentColor" />
                <rect x="8" y="4" width="6" height="2" fill="currentColor" />
                <rect x="6" y="6" width="10" height="2" fill="currentColor" />
                <rect x="4" y="8" width="14" height="2" fill="currentColor" />
                <rect x="6" y="10" width="10" height="2" fill="currentColor" />
                <rect x="8" y="12" width="6" height="2" fill="currentColor" />
                <rect x="10" y="14" width="2" height="2" fill="currentColor" />
                <rect x="4" y="16" width="14" height="2" fill="currentColor" />
              </svg>
            </strong> Celebration settings (Try Random Mode for surprise songs!)</li>
            <li><strong><svg width="12" height="12" viewBox="0 0 20 20" className="inline-block mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="16" fill="currentColor" />
              <rect x="6" y="6" width="2" height="8" fill={darkMode ? 'black' : 'white'} />
              <rect x="12" y="6" width="2" height="8" fill={darkMode ? 'black' : 'white'} />
              <rect x="6" y="6" width="8" height="2" fill={darkMode ? 'black' : 'white'} />
              <rect x="6" y="12" width="8" height="2" fill={darkMode ? 'black' : 'white'} />
            </svg></strong> View visit count</li>
            <li><strong><svg width="12" height="12" viewBox="0 0 20 20" className="inline-block mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="16" height="4" fill="currentColor" />
              <rect x="14" y="2" width="4" height="4" fill="currentColor" />
              <rect x="2" y="12" width="16" height="4" fill="currentColor" />
              <rect x="2" y="10" width="4" height="4" fill="currentColor" />
            </svg></strong> Shuffle tasks randomly</li>
            <li><strong>?:</strong> Show/hide this help</li>
            <li><strong>↓:</strong> Download list as Markdown</li>
            <li><strong>↑:</strong> Upload Markdown list</li>
          </ul>
          
          <div className="mt-6 pt-4 text-xs text-center border-t-2" style={{ borderColor: darkMode ? '#ffffff' : '#000000' }}>
            <p>THE LISTER v2.0</p>
            <p className="mt-1 opacity-70">The minimal yet fun task manager</p>
          </div>
        </div>
      )}
    </div>
  );
} 