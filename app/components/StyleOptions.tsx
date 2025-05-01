'use client';

import React, { useState, useEffect } from 'react';

interface StyleSettings {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
}

interface StyleOptionsProps {
  styleSettings: StyleSettings;
  setStyleSettings: React.Dispatch<React.SetStateAction<StyleSettings>>;
  updateMonochromeColor?: (newColor: string) => void;
  isDarkMode: boolean;
}

const fontOptions = [
  { name: 'Saira', value: 'var(--font-saira)', author: null },
  { name: 'Fogtwo No5', value: 'var(--font-fogtwo)', author: 'gluk' },
  { name: 'VG5000', value: 'var(--font-vg5000)', author: 'Justin Bihan' },
];

const fontSizeOptions = [
  { name: 'Small', value: '14px' },
  { name: 'Medium', value: '16px' },
  { name: 'Large', value: '18px' },
  { name: 'X-Large', value: '20px' }
];

// Color definitions
const COLORS = {
  LIGHT: {
    WHITE: '#ffffff',
    SEPIA: '#f5f0e5',
    TEXT: '#000000',
  },
  DARK: {
    WHITE: '#1a1a1a',
    SEPIA: '#2c2520',
    TEXT_WHITE: '#ffffff',
    TEXT_SEPIA: '#f5f0e5',
  }
};

export default function StyleOptions({ 
  styleSettings, 
  setStyleSettings, 
  updateMonochromeColor,
  isDarkMode
}: StyleOptionsProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'text'>('colors');
  const [showFontPreview, setShowFontPreview] = useState(false);
  
  // Get background colors based on current mode - put sepia first
  const backgroundPalette = isDarkMode ? 
    [
      { name: 'Dark Sepia', value: COLORS.DARK.SEPIA },
      { name: 'Dark Gray', value: COLORS.DARK.WHITE },
    ] : 
    [
      { name: 'Sepia', value: COLORS.LIGHT.SEPIA },
      { name: 'White', value: COLORS.LIGHT.WHITE },
    ];
  
  // Get text colors based on current mode
  const textColorPalette = isDarkMode ? 
    [
      { name: 'White', value: COLORS.DARK.TEXT_WHITE },
      { name: 'Light Sepia', value: COLORS.DARK.TEXT_SEPIA },
    ] : 
    [
      { name: 'Black', value: COLORS.LIGHT.TEXT },
    ];
  
  // Make sure text color is appropriate for the current mode on initial load and mode change
  useEffect(() => {
    if (isDarkMode) {
      // Make sure we're using a light text color in dark mode
      if (styleSettings.textColor === COLORS.LIGHT.TEXT) {
        setStyleSettings({
          ...styleSettings,
          textColor: COLORS.DARK.TEXT_WHITE
        });
      }
    } else {
      // Make sure we're using black text in light mode
      if (styleSettings.textColor !== COLORS.LIGHT.TEXT) {
        setStyleSettings({
          ...styleSettings,
          textColor: COLORS.LIGHT.TEXT
        });
      }
    }
  }, [isDarkMode]);
  
  const handleColorClick = (color: string, target: 'background' | 'text') => {
    if (target === 'background') {
      // Update background color
      setStyleSettings({ 
        ...styleSettings, 
        backgroundColor: color,
      });
      
      if (updateMonochromeColor) {
        updateMonochromeColor(color);
      }
    } else {
      // Update text color
      setStyleSettings({ 
        ...styleSettings, 
        textColor: color 
      });
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyleSettings({ ...styleSettings, fontFamily: e.target.value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyleSettings({ ...styleSettings, fontSize: e.target.value });
  };

  const selectFont = (fontFamily: string) => {
    setStyleSettings({ ...styleSettings, fontFamily });
    setShowFontPreview(false);
  };

  const textColor = isDarkMode ? styleSettings.textColor : '#000000';
  const borderColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <div 
      className="text-current" 
      style={{ fontFamily: styleSettings.fontFamily }}
    >      
      <div className={`flex border-b-3 mb-4`} style={{ borderColor }}>
        <button 
          className={`pb-2 px-3 text-sm font-bold uppercase ${activeTab === 'colors' ? 'border-b-3 font-bold' : 'opacity-70'}`}
          style={{ borderColor: activeTab === 'colors' ? borderColor : 'transparent' }}
          onClick={() => setActiveTab('colors')}
        >
          Colors
        </button>
        <button 
          className={`pb-2 px-3 text-sm font-bold uppercase ${activeTab === 'text' ? 'border-b-3 font-bold' : 'opacity-70'}`}
          style={{ borderColor: activeTab === 'text' ? borderColor : 'transparent' }}
          onClick={() => setActiveTab('text')}
        >
          Typography
        </button>
      </div>

      {activeTab === 'colors' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase mb-2">Background</label>
            <div className="flex flex-wrap gap-3">
              {backgroundPalette.map(color => (
                <button
                  key={`bg-${color.value}`}
                  className={`w-10 h-10 border-3 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform ${styleSettings.backgroundColor === color.value ? 'outline outline-2 outline-offset-2' : ''}`}
                  style={{ 
                    backgroundColor: color.value,
                    borderColor,
                    outlineColor: borderColor,
                    boxShadow: styleSettings.backgroundColor === color.value ? 'none' : `3px 3px 0px ${isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                  }}
                  onClick={() => handleColorClick(color.value, 'background')}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs mt-2">
              Choose between {isDarkMode ? 'Dark Gray or Dark Sepia' : 'White or Sepia'} background
            </p>
          </div>
          
          {isDarkMode && (
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase mb-2">Text Color</label>
              <div className="flex flex-wrap gap-3">
                {textColorPalette.map(color => (
                  <button
                    key={`text-${color.value}`}
                    className={`w-10 h-10 border-3 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform ${styleSettings.textColor === color.value ? 'outline outline-2 outline-offset-2' : ''}`}
                    style={{ 
                      backgroundColor: color.value,
                      borderColor,
                      outlineColor: borderColor,
                      boxShadow: styleSettings.textColor === color.value ? 'none' : `3px 3px 0px ${isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`
                    }}
                    onClick={() => handleColorClick(color.value, 'text')}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs mt-2">
                Choose between White or Light Sepia text in dark mode
              </p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'text' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold uppercase">Font Family</label>
              <button 
                className="text-xs font-bold hover:underline"
                onClick={() => setShowFontPreview(!showFontPreview)}
              >
                {showFontPreview ? 'Hide Preview' : 'Show All Fonts'}
              </button>
            </div>
            
            {showFontPreview ? (
              <div className="space-y-0 max-h-40 overflow-y-auto border-3 p-0" 
                  style={{ 
                    backgroundColor: styleSettings.backgroundColor,
                    borderColor
                  }}
              >
                {fontOptions.map(font => (
                  <button
                    key={font.value}
                    className="block w-full text-left p-2 text-sm font-bold border-b last:border-b-0"
                    style={{ 
                      fontFamily: font.value,
                      backgroundColor: styleSettings.backgroundColor,
                      borderColor,
                      color: textColor
                    }}
                    onClick={() => selectFont(font.value)}
                  >
                    {font.name}
                    {font.author && (
                      <span className="font-attribution block ml-2">by {font.author}</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <select 
                  value={styleSettings.fontFamily} 
                  onChange={handleFontFamilyChange}
                  className="w-full p-2 border-3 text-sm font-bold"
                  style={{ 
                    boxShadow: `3px 3px 0px ${isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`, 
                    fontFamily: styleSettings.fontFamily,
                    backgroundColor: styleSettings.backgroundColor,
                    borderColor,
                    color: textColor
                  }}
                >
                  {fontOptions.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name} {font.author ? `by ${font.author}` : ''}
                    </option>
                  ))}
                </select>
                <div 
                  className="mt-3 p-3 border-3 text-center font-bold" 
                  style={{ 
                    fontFamily: styleSettings.fontFamily, 
                    boxShadow: `3px 3px 0px ${isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`,
                    backgroundColor: styleSettings.backgroundColor,
                    borderColor,
                    color: textColor
                  }}
                >
                  Preview text with this font
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase mb-1">Font Size</label>
            <select 
              value={styleSettings.fontSize} 
              onChange={handleFontSizeChange}
              className="w-full p-2 border-3 text-sm font-bold"
              style={{ 
                boxShadow: `3px 3px 0px ${isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`, 
                fontFamily: styleSettings.fontFamily,
                backgroundColor: styleSettings.backgroundColor,
                borderColor,
                color: textColor
              }}
            >
              {fontSizeOptions.map(size => (
                <option key={size.value} value={size.value}>{size.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 