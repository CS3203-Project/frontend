import React, { useState, useRef, useEffect } from 'react';
import { Languages, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from './Loader';

interface FloatingTranslateIconProps {
  // Optional callback for when translation is completed
  onTranslation?: (originalText: string, translatedText: string) => void;
}

interface TranslationOverlay {
  id: string; // Unique ID for each overlay
  element: Element;
  originalText: string;
  translatedText: string;
  position: { x: number; y: number };
  language: string;
  isDragging?: boolean; // Track if this specific overlay is being dragged
}

interface PlacedIcon {
  element: Element;
  position: { x: number; y: number };
}

const FloatingTranslateIcon: React.FC<FloatingTranslateIconProps> = ({ onTranslation }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyDragged, setRecentlyDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDragReminder, setShowDragReminder] = useState(false);
  const [iconPosition, setIconPosition] = useState(() => {
    const stored = localStorage.getItem('floatingTranslateIconPosition');
    return stored ? JSON.parse(stored) : { x: 0, y: 0 }; // Default position will be set by useEffect
  });
  const [overlays, setOverlays] = useState<TranslationOverlay[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [loaderMinTime, setLoaderMinTime] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem('floatingTranslateIconVisible');
    return stored !== null ? JSON.parse(stored) : true;
  });
  // We'll just use the recentlyDragged flag to track post-drag state
  const { i18n } = useTranslation('common');

  const dragRef = useRef<HTMLDivElement>(null);

  // Available languages for translation (used for language names and flag display)
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
  ];

  useEffect(() => {
    // Initial position (bottom-right corner, accounting for scroll)
    const updatePosition = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const iconSize = 56; // Icon container size

      // Only set default position if not already set from localStorage
      if (iconPosition.x === 0 && iconPosition.y === 0) {
        const defaultPos = {
          x: windowWidth - 80, // 20px padding from edge
          y: windowHeight - 100, // 40px padding from bottom
        };
        setIconPosition(defaultPos);
        localStorage.setItem('floatingTranslateIconPosition', JSON.stringify(defaultPos));
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Save position when it changes
  useEffect(() => {
    localStorage.setItem('floatingTranslateIconPosition', JSON.stringify(iconPosition));
  }, [iconPosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('🖱️ Mouse down event'); // Debug log

    // Prevent text selection and default behavior
    e.preventDefault();
    e.stopPropagation();

    // Set proper cursor and prevent selection
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    // Use the initial mouse position when dragging started
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialIconX = iconPosition.x;
    const initialIconY = iconPosition.y;
    const startTime = Date.now();

    console.log(`📍 Initial - Mouse: (${initialMouseX}, ${initialMouseY}), Icon: (${initialIconX}, ${initialIconY})`);

    // Reset any previous state and set dragging to true
    setRecentlyDragged(false); // Clear any previous state
    setIsDragging(true); // Now we're dragging

    // Track whether the mouse actually moved during this drag
    let hasActuallyMoved = false;
    let mouseMovedDistance = 0;

    // Handler functions defined inside to capture closure
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate movement distance to determine if this was a real drag
      const deltaX = moveEvent.clientX - initialMouseX;
      const deltaY = moveEvent.clientY - initialMouseY;
      mouseMovedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Consider it a real drag if moved more than 5 pixels
      if (mouseMovedDistance > 5) {
        hasActuallyMoved = true;
      }

      // Calculate new position based on mouse movement
      const newX = initialIconX + deltaX;
      const newY = initialIconY + deltaY;

      // Constrain to viewport bounds
      const maxX = window.innerWidth - 56;
      const maxY = window.innerHeight - 56;

      const constrainedPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };

      // Update position immediately during drag
      setIconPosition(constrainedPosition);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('🖱️ Mouse up - duration:', duration, 'ms, moved distance:', mouseMovedDistance, 'hasActuallyMoved:', hasActuallyMoved);

      // Remove event listeners FIRST
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Clean up drag state immediately
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // CRITICAL FIX: Handle both drag and click scenarios
      if (hasActuallyMoved) {
        // This was a real drag - set ready to translate
        console.log('✅ Real drag detected - setting ready to translate');
        setTimeout(() => {
          setRecentlyDragged(true);
        }, 100); // 100ms delay to ensure clean state transition

        // Automatically reset recentlyDragged state after 5 seconds if user doesn't click
        setTimeout(() => {
          setRecentlyDragged(false);
        }, 5000);
      } else if (duration < 200 && mouseMovedDistance < 5) {
        // This was a quick click without drag - handle it as a click
        console.log('🖱️ Quick click detected - checking if ready to translate');

        // Small delay to ensure state is clean, then check if we should translate
        setTimeout(() => {
          if (recentlyDragged) {
            console.log('✅ Click after drag - triggering translation');
            handleIconClick(upEvent as any); // Cast to React event for compatibility
          } else {
            console.log('🚫 Click without drag - showing reminder');
            setShowDragReminder(true);
            setTimeout(() => setShowDragReminder(false), 4000);
          }
        }, 50);
      }

      // Get final position after drag
      console.log('📍 Icon positioned at:', iconPosition);

      // IMPORTANT: Prevent any mouseup event from triggering other handlers
      upEvent.stopPropagation();
      upEvent.preventDefault();
    };

    // Add listeners to document to capture mouse movements even outside component
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    console.log('👆 Touch start event'); // Debug log

    // Prevent default touch behaviors (scrolling, zooming)
    e.preventDefault();
    e.stopPropagation();

    // Prevent text selection and default behavior
    document.body.style.userSelect = 'none';

    // Use the initial touch position when dragging started
    const touch = e.touches[0];
    const initialTouchX = touch.clientX;
    const initialTouchY = touch.clientY;
    const initialIconX = iconPosition.x;
    const initialIconY = iconPosition.y;
    const startTime = Date.now();

    console.log(`📍 Initial - Touch: (${initialTouchX}, ${initialTouchY}), Icon: (${initialIconX}, ${initialIconY})`);

    // Reset any previous state and set dragging to true
    setRecentlyDragged(false); // Clear any previous state
    setIsDragging(true); // Now we're dragging

    // Track whether the touch actually moved during this drag
    let hasActuallyMoved = false;
    let touchMovedDistance = 0;

    // Handler functions defined inside to capture closure
    const handleTouchMove = (moveEvent: TouchEvent) => {
      // Prevent default to stop scrolling
      moveEvent.preventDefault();

      const touch = moveEvent.touches[0];
      if (!touch) return;

      // Calculate movement distance to determine if this was a real drag
      const deltaX = touch.clientX - initialTouchX;
      const deltaY = touch.clientY - initialTouchY;
      touchMovedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Consider it a real drag if moved more than 5 pixels
      if (touchMovedDistance > 5) {
        hasActuallyMoved = true;
      }

      // Calculate new position based on touch movement
      const newX = initialIconX + deltaX;
      const newY = initialIconY + deltaY;

      // Constrain to viewport bounds
      const maxX = window.innerWidth - 56;
      const maxY = window.innerHeight - 56;

      const constrainedPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };

      // Update position immediately during drag
      setIconPosition(constrainedPosition);
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('👆 Touch end - duration:', duration, 'ms, moved distance:', touchMovedDistance, 'hasActuallyMoved:', hasActuallyMoved);

      // Remove event listeners FIRST
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      // Clean up drag state immediately
      setIsDragging(false);
      document.body.style.userSelect = '';

      // Handle both drag and tap scenarios
      if (hasActuallyMoved) {
        // This was a real drag - set ready to translate
        console.log('✅ Real touch drag detected - setting ready to translate');
        setTimeout(() => {
          setRecentlyDragged(true);
        }, 100); // 100ms delay to ensure clean state transition

        // Automatically reset recentlyDragged state after 5 seconds if user doesn't tap
        setTimeout(() => {
          setRecentlyDragged(false);
        }, 5000);
      } else if (duration < 200 && touchMovedDistance < 5) {
        // This was a quick tap without drag - handle it as a tap
        console.log('👆 Quick tap detected - checking if ready to translate');

        // Small delay to ensure state is clean, then check if we should translate
        setTimeout(() => {
          if (recentlyDragged) {
            console.log('✅ Tap after drag - triggering translation');
            // Create a synthetic mouse event for compatibility with handleIconClick
            const syntheticEvent = {
              clientX: initialTouchX,
              clientY: initialTouchY,
              preventDefault: () => {},
              stopPropagation: () => {},
            };
            handleIconClick(syntheticEvent as any);
          } else {
            console.log('🚫 Tap without drag - showing reminder');
            setShowDragReminder(true);
            setTimeout(() => setShowDragReminder(false), 4000);
          }
        }, 50);
      }

      // Get final position after drag
      console.log('📍 Icon positioned at:', iconPosition);

      // Prevent any default touch end behavior
      endEvent.preventDefault();
    };

    // Add listeners to document to capture touch movements even outside component
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  // Handle clicking on the floating icon to show translation of element underneath
  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('👆 Icon clicked, isDragging:', isDragging, 'recentlyDragged:', recentlyDragged);
    
    // Prevent any default behavior and event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Don't do anything if we're currently dragging
    if (isDragging) {
      console.log('🚫 Ignoring click during drag');
      return;
    }
    
    // CRITICAL FIX: If not recently dragged, ignore the click
    // User must drag first, then click
    if (!recentlyDragged) {
      console.log('🚫 Not ready to translate - drag the icon first! (recentlyDragged:', recentlyDragged, ')');
      // Show a visual reminder to the user
      setShowDragReminder(true);
      setTimeout(() => setShowDragReminder(false), 4000);
      return;
    }
    
    console.log('✅ Processing click for translation - FIRST CLICK SHOULD WORK');
    
    // Reset the recentlyDragged state since we're now processing the translation
    setRecentlyDragged(false);
    console.log('✅ This was the expected click after drag');

    // Temporarily hide the floating icon for element detection
    const originalDisplay = dragRef.current?.style.display;
    if (dragRef.current) {
      dragRef.current.style.display = 'none';
    }

    // Get all elements at the cursor position (in case we need to check multiple)
    const x = e.clientX;
    const y = e.clientY;
    console.log('🖱️ Cursor position:', x, y);
    
    // Get the element at the cursor position
    let targetElement = document.elementFromPoint(x, y);
    console.log('🎯 Target element at cursor:', targetElement);
    
    // If first element has no text, try to find the closest parent with text
    if (targetElement && (!targetElement.textContent || targetElement.textContent.trim() === '')) {
      let currentElement = targetElement;
      let maxAttempts = 3; // Limit how far up we go
      
      while (maxAttempts > 0 && currentElement && currentElement.parentElement) {
        if (currentElement.parentElement.textContent && 
            currentElement.parentElement.textContent.trim() !== '') {
          targetElement = currentElement.parentElement;
          console.log('🎯 Found parent with text:', targetElement);
          break;
        }
        currentElement = currentElement.parentElement;
        maxAttempts--;
      }
    }

    // Restore the icon visibility
    if (dragRef.current) {
      dragRef.current.style.display = originalDisplay || '';
    }

    if (targetElement) {
      const textContent = targetElement.textContent?.trim() || '';
      const isClickableElement = targetElement.tagName === 'BUTTON' ||
                               targetElement.tagName === 'A' ||
                               targetElement.tagName === 'INPUT' ||
                               targetElement.tagName === 'TEXTAREA' ||
                               targetElement.classList.contains('clickable');

      console.log('📄 Text content:', textContent, 'isClickable:', isClickableElement);
      console.log('🔍 Current state - recentlyDragged:', recentlyDragged, 'isDragging:', isDragging);

      if (textContent && textContent.length > 0) {
        console.log('✅ Found text, showing translation');
        showTranslation(targetElement, iconPosition.x + 28, iconPosition.y);
      } else {
        console.log('❌ No valid text found in primary element');
        
        // Fallback - try getting text from the element's children
        let foundTextInChild = false;
        if (targetElement.children && targetElement.children.length > 0) {
          // Check first child with text
          for (let i = 0; i < targetElement.children.length; i++) {
            const childText = targetElement.children[i].textContent?.trim() || '';
            if (childText && childText.length > 0) {
              console.log('🔍 Found text in child element:', childText);
              showTranslation(targetElement.children[i], iconPosition.x + 28, iconPosition.y);
              foundTextInChild = true;
              break;
            }
          }
        }
        
        if (!foundTextInChild) {
          console.log('❌ No valid text found in any child elements');
          
          // Try to find text in parent elements if nothing found
          let parentElement = targetElement.parentElement;
          let maxParentAttempts = 2;
          
          while (!foundTextInChild && parentElement && maxParentAttempts > 0) {
            const parentText = parentElement.textContent?.trim() || '';
            if (parentText && parentText.length > 0) {
              console.log('🔍 Found text in parent element:', parentText);
              showTranslation(parentElement, iconPosition.x + 28, iconPosition.y);
              foundTextInChild = true;
              break;
            }
            parentElement = parentElement.parentElement;
            maxParentAttempts--;
          }
          
          // If still nothing found, show an error message to the user
          if (!foundTextInChild) {
            alert('No text found to translate. Try positioning the icon directly over text.');
          }
        }
      }
    }
  };

  const extractTextFromElement = (element: Element): string => {
    // Get text content from various element types
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return (element as HTMLInputElement).value || (element as HTMLTextAreaElement).value;
    }

    if (element.tagName === 'BUTTON') {
      return element.textContent || element.getAttribute('aria-label') || '';
    }
    
    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') || element.getAttribute('title') || '';
    }
    
    // Check for common accessibility attributes that might contain text
    const ariaLabel = element.getAttribute('aria-label');
    const ariaDescription = element.getAttribute('aria-description');
    const title = element.getAttribute('title');
    
    // First try direct text content
    const directText = element.textContent?.trim() || '';
    
    // If direct text is empty but element has children, we might be clicking a container
    if (!directText && element.children && element.children.length > 0) {
      // Look for the first child with actual text content
      for (const child of Array.from(element.children)) {
        const childText = child.textContent?.trim();
        if (childText) return childText;
      }
    }

    // Return the first available text content
    return directText || ariaLabel || ariaDescription || title || '';
  };

  const translateTextWithGemini = async (text: string, targetLanguage: string): Promise<string> => {
    console.log('🔄 translateTextWithGemini called:', { text, targetLanguage });

    // For testing, we'll use a fallback mechanism to simulate translation
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔑 API Key status:', apiKey ? '✅ Available' : '❌ Missing');

    if (!apiKey) {
      console.warn('Gemini API key not found, using mock translation');

      // Simple mock translation for testing purposes
      const mockTranslations = {
        'en': {
          'Hello': 'Hello',
          'How are you?': 'How are you?',
          'Welcome': 'Welcome',
          'Thank you': 'Thank you',
        },
        'si': {
          'Hello': 'ආයුබෝවන්',
          'How are you?': 'කොහොමද ඉන්නේ?',
          'Welcome': 'සාදරයෙන් පිළිගන්නවා',
          'Thank you': 'ස්තූතියි',
        },
        'ta': {
          'Hello': 'வணக்கம்',
          'How are you?': 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
          'Welcome': 'வரவேற்கிறோம்',
          'Thank you': 'நன்றி',
        }
      };

      // Check if we have a mock translation for this text
      if (mockTranslations[targetLanguage]?.[text]) {
        const mockResult = mockTranslations[targetLanguage][text];
        console.log('🔄 Mock translation result:', mockResult);
        return mockResult;
      }

      // Return with a prefix to show it was translated
      const mockFallback = `[${targetLanguage}] ` + text;
      console.log('🔄 Mock fallback result:', mockFallback);
      return mockFallback;
    }

    try {
      const prompt = `Translate the following text to ${targetLanguage}:\n\n"${text}"\n\nProvide only the translation, no explanations or quotes.`;
      console.log('📤 Sending request to Gemini API:', { prompt, targetLanguage });

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };
      console.log('📦 Request body:', requestBody);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 Full API response:', JSON.stringify(data, null, 2));

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const translatedText = data.candidates[0].content.parts[0].text.trim();
        console.log('✅ Translation successful:', translatedText);
        return translatedText;
      }

      console.warn('⚠️ No translation found in response, using fallback');
      console.log('⚠️ Fallback text:', text);
      return text; // Fallback
    } catch (error) {
      console.error('❌ Gemini translation failed:', error);
      console.log('❌ Falling back to original text:', text);
      return text; // Fallback to original text
    }
  };

  const showTranslation = async (element: Element, clientX: number, clientY: number) => {
    console.log('🌍 showTranslation called for element:', element);
    const originalText = extractTextFromElement(element);
    console.log('📝 Extracted text:', originalText);

    if (!originalText || originalText.length === 0) {
      console.log('❌ No text to translate, aborting');
      return;
    }

    console.log('✅ Starting translation process');
    setIsTranslating(true);
    setLoaderMinTime(true);

    // Start minimum loader display timer (2 seconds for better visibility)
    setTimeout(() => {
      setLoaderMinTime(false);
    }, 2000);

    // Show a temporary loading overlay for better UX during translation
    const tempLoadingOverlay: TranslationOverlay = {
      id: `loading-${Date.now()}`, // Generate a unique ID
      element,
      originalText,
      translatedText: "Translating...",
      position: {
        x: clientX,
        y: clientY - 80, // Position above where the user clicked
      },
      language: 'loading', // Special case for loading state
      isDragging: false,
    };
    
    // Add the loading overlay
    setOverlays(prev => [...prev, tempLoadingOverlay]);

    try {
      // Get the user's selected language from localStorage (navbar selection)
      const selectedLng = localStorage.getItem('i18nextLng') || 'en';

      // Calculate overlay position (centered over the element)
      const rect = element.getBoundingClientRect();
      const overlayPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top - 80, // Above the element
      };

      // Always attempt translation to the user's selected language
      const translatedText = await translateTextWithGemini(originalText, selectedLng);

      const newOverlay: TranslationOverlay = {
        id: `translation-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        element,
        originalText,
        translatedText,
        position: overlayPosition,
        language: selectedLng,
        isDragging: false,
      };

      // Replace the loading overlay with the actual translation result
      setOverlays(prev => prev
        .filter(o => !(o.originalText === originalText && o.language === 'loading')) // Remove loading overlay
        .concat(newOverlay) // Add the new translation
      );

      // Trigger callback if provided
      onTranslation?.(originalText, translatedText);

    } catch (error) {
      console.error('Translation failed:', error);
      
      // Replace loading overlay with error message
      setOverlays(prev => prev
        .filter(o => !(o.originalText === originalText && o.language === 'loading'))
        .concat({
          id: `error-${Date.now()}`,
          element,
          originalText,
          translatedText: "Translation failed. Please try again.",
          position: {
            x: clientX,
            y: clientY - 80,
          },
          language: 'error', // Special case for error state
          isDragging: false,
        })
      );
      
      // Auto-remove error message after 3 seconds
      setTimeout(() => {
        setOverlays(prev => prev.filter(o => !(o.originalText === originalText && o.language === 'error')));
      }, 3000);
      
    } finally {
      // Hide loader only if minimum time has passed
      if (!loaderMinTime) {
        setIsTranslating(false);
      } else {
        // Wait for minimum time to pass before hiding loader
        setTimeout(() => {
          setIsTranslating(false);
        }, 100);
      }
    }
  };

  // Remove the global drop handlers as we handle it in mouseUp

  const getLanguageFlag = (langCode: string) => {
    // Special states
    if (langCode === 'loading') return '⏳'; // Loading state
    if (langCode === 'error') return '⚠️'; // Error state
    
    // Normal language
    return availableLanguages.find(lang => lang.code === langCode)?.flag || '🌐';
  };

  // Save visibility preference when it changes
  useEffect(() => {
    localStorage.setItem('floatingTranslateIconVisible', JSON.stringify(isVisible));
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const removeOverlay = (overlayToRemove: TranslationOverlay) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== overlayToRemove.id));
  };
  
  // Handle dragging functionality for translation overlays
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't proceed if we clicked on buttons (close or copy buttons)
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('button')) {
      console.log('🖱️ Ignoring drag on button');
      return;
    }
    
    console.log('🖱️ Starting overlay drag for:', overlayId);
    
    // Set cursor style and prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    // Get the initial mouse position and overlay position
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;

    // Find the overlay being dragged
    const draggedOverlay = overlays.find(o => o.id === overlayId);
    if (!draggedOverlay) {
      console.log('⚠️ Could not find overlay with ID:', overlayId);
      return;
    }
    
    const initialOverlayX = draggedOverlay.position.x;
    const initialOverlayY = draggedOverlay.position.y;
    
    console.log('📍 Initial overlay position:', initialOverlayX, initialOverlayY);
    
    // Set dragging state for this overlay
    setOverlays(prev => prev.map(o => 
      o.id === overlayId ? { ...o, isDragging: true } : o
    ));

    // Define handlers for mouse move and mouse up
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate new position based on mouse movement
      const deltaX = moveEvent.clientX - initialMouseX;
      const deltaY = moveEvent.clientY - initialMouseY;

      const newX = initialOverlayX + deltaX;
      const newY = initialOverlayY + deltaY;

      // Constrain to viewport bounds with some padding
      const maxX = window.innerWidth - 200; // Approximate width of overlay
      const maxY = window.innerHeight - 200; // Approximate height of overlay

      const constrainedPosition = {
        x: Math.max(100, Math.min(newX, maxX)),
        y: Math.max(50, Math.min(newY, maxY)),
      };

      // Update position of just this overlay
      setOverlays(prev => prev.map(o =>
        o.id === overlayId 
          ? { ...o, position: constrainedPosition }
          : o
      ));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      console.log('🖱️ Finished overlay drag');
      
      // Clean up - remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Reset cursor and user selection
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Reset dragging state for this overlay
      setOverlays(prev => prev.map(o => 
        o.id === overlayId ? { ...o, isDragging: false } : o
      ));
      
      // Prevent any other handlers
      upEvent.stopPropagation();
      upEvent.preventDefault();
    };

    // Add the event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Don't render anything if not visible
  if (!isVisible) {
    return (
      <>
        {/* Translation Overlay Tooltips - still show even when icon is hidden */}
        {overlays.map((overlay, index) => (
          <div
            key={index}
            className="fixed z-50 pointer-events-auto"
            style={{
              left: overlay.position.x,
              top: overlay.position.y,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-black/95 backdrop-blur-sm text-white rounded-lg shadow-2xl border border-gray-300 p-4 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageFlag(overlay.language)}</span>
                  <span className="text-sm font-medium opacity-80">Translation</span>
                </div>
                <button
                  onClick={() => removeOverlay(overlay)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Close"
                >
                  <Trash2 className="w-4 h-4 text-white hover:text-gray-800" />
                </button>
              </div>

              {/* Translated text only */}
              <div className="text-base font-medium">
                {overlay.translatedText}
              </div>
            </div>

            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/95" />
            </div>
          </div>
        ))}
      </>
    );
  }

  // Add custom animation
  useEffect(() => {
    // Add the CSS animation for the popIn effect
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes popIn {
        0% { transform: scale(0.95); opacity: 0.7; }
        50% { transform: scale(1.02); opacity: 0.9; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  return (
    <>
      {/* Floating Translation Icon */}
      <div
        ref={dragRef}
        className={`fixed z-50 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
          isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'
        }`}
        style={{
          left: iconPosition.x,
          top: iconPosition.y,
          filter: isDragging ? 'brightness(1.2)' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        draggable={false}
        title={recentlyDragged ? "Click now to translate" : "⚠️ First: Drag me over text, then click to translate!"}
      >
      <div className="relative">
        {/* Main icon container */}
          <div className={`w-10 h-10 bg-gradient-to-br ${recentlyDragged ? 'from-slate-600 to-slate-800' : 'from-gray-600 to-gray-800'} rounded-full flex items-center justify-center shadow-lg border ${recentlyDragged ? 'border-blue-400 border-2' : 'border-gray-400'} backdrop-blur-sm
            ${isDragging ? 'animate-pulse' : ''}`}>
            <Languages className="w-7 h-7 text-white" />

            {/* Translating indicator - using existing Loader component */}
            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader size="sm" variant="white" />
              </div>
            )}
            
            {/* Ready for translation click indicator */}
            {recentlyDragged && (
              <>
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{animationDuration: '1s'}} />
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-gray-400">
                  <span className="animate-pulse">👆</span> Click now to translate
                </div>
              </>
            )}
            
            {/* Not ready indicator - shown when icon hasn't been dragged */}
            {!recentlyDragged && !isDragging && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-gray-500/50 opacity-0 hover:opacity-100 transition-opacity">
                <span>👆</span> Drag first, then tap
              </div>
            )}
          </div>          {/* Hover effect ring */}
          <div className={`absolute inset-0 rounded-full border-2 border-white/30 transition-all duration-300 ${
            isDragging ? 'scale-125 opacity-100' : 'scale-100 opacity-0'
          }`} />
        </div>
      </div>

      {/* Translation Overlay Tooltips */}
      {overlays.map((overlay, index) => (
        <div
          key={overlay.id}
          className={`fixed z-50 pointer-events-auto transition-[z-index] duration-0 ${overlay.isDragging ? 'z-[60]' : 'z-50'}`}
          style={{
            left: overlay.position.x,
            top: overlay.position.y,
            transform: 'translateX(-50%)',
            cursor: overlay.isDragging ? 'grabbing' : 'default',
            transition: 'transform 0.05s ease-out'
          }}
        >
            <div
              className={`
                bg-black/95 dark:bg-gray-900 backdrop-blur-md text-white rounded-lg shadow-2xl
                ${overlay.language === 'loading' ? 'border border-gray-400/70 p-3 max-w-sm animate-pulse' :
                  overlay.language === 'error' ? 'border border-red-500/70 p-3 max-w-sm' :
                  overlay.isDragging ? 'border-2 border-blue-400/50 p-4 max-w-md' : 'border border-blue-500/30 p-4 max-w-md'
                } animate-in ${overlay.language === 'loading' ? 'fade-in duration-200' : 'slide-in-from-bottom-2 duration-300'}
                ${overlay.isDragging ? 'ring-2 ring-blue-400 dark:ring-blue-600' : ''}
                transition-all duration-150
              `}
            style={{
              transformOrigin: 'center bottom',
              animation: overlay.language !== 'loading' && overlay.language !== 'error' ? 'popIn 0.3s ease-out' : undefined,
              boxShadow: overlay.isDragging ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)' : undefined,
              transform: overlay.isDragging ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseDown={(e) => overlay.language !== 'loading' && overlay.language !== 'error' ? handleOverlayMouseDown(e, overlay.id) : null}
          >
            {overlay.language === 'loading' ? (
              /* Loading state with shared Loader component */
              <div className="flex flex-col items-center justify-center py-2">
                <Loader size="md" variant="primary" className="mb-3" />
                <div className="text-base font-medium">Translating...</div>
                <div className="text-xs text-gray-400 mt-1">{overlay.originalText.substring(0, 30)}{overlay.originalText.length > 30 ? '...' : ''}</div>
              </div>
            ) : overlay.language === 'error' ? (
              /* Error state */
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <div className="text-base font-medium text-red-600 dark:text-red-400">Translation failed</div>
                <div className="text-xs text-gray-500 mt-1 text-center">Please try again or check your connection</div>
                <button
                  onClick={() => removeOverlay(overlay)}
                  className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 rounded text-xs text-red-700 dark:text-red-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              /* Normal translation */
              <>
                {/* Header */}
                <div 
                  className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
                  title="Drag to move translation overlay"
                >
                  <div className="flex items-center space-x-2">
                    {/* Drag handle */}
                    <div className="flex items-center justify-center p-1 mr-1 opacity-50 hover:opacity-100 bg-gray-100 dark:bg-gray-700 rounded group cursor-grab active:cursor-grabbing">
                      <div className="flex flex-col gap-[2px]">
                        <div className="flex gap-[2px]">
                          <div className="w-1 h-1 rounded-full bg-current"></div>
                          <div className="w-1 h-1 rounded-full bg-current"></div>
                        </div>
                        <div className="flex gap-[2px]">
                          <div className="w-1 h-1 rounded-full bg-current"></div>
                          <div className="w-1 h-1 rounded-full bg-current"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xl">{getLanguageFlag(overlay.language)}</span>
                    <span className="text-sm font-semibold">{availableLanguages.find(lang => lang.code === overlay.language)?.name || 'Translation'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => navigator.clipboard.writeText(overlay.translatedText)}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Copy translation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => removeOverlay(overlay)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Close"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Just the translated text - clean and simple */}
                <div className="text-base font-medium leading-relaxed">
                  {overlay.translatedText}
                </div>

                {/* Bottom hint with dragging info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Drag header to move</span>
                    <span>•</span>
                    <span>Click × to close</span>
                  </div>
                  <span className="text-blue-500">Powered by Gemini AI</span>
                </div>
              </>
            )}
          </div>

          {/* Arrow pointing down - hide when dragging */}
          {!overlay.isDragging && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 transition-opacity">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
            </div>
          )}
        </div>
      ))}

      {/* Instructions tooltip - shown briefly on page load */}
      <div className="fixed bottom-4 right-4 z-40 bg-black/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl border border-white/20 max-w-xs animate-in slide-in-from-right duration-500 opacity-0 animate-hide">
        <div className="text-sm">
          💡 <strong>Tip:</strong> Drag the floating
          <Languages className="inline w-4 h-4 mx-1" />
          icon to reposition it, then click to translate text underneath!
        </div>
      </div>
      
      {/* Drag Reminder - shown when user tries to click without dragging first */}
      {showDragReminder && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] bg-black/95 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl border border-gray-300 max-w-md animate-in zoom-in duration-300">
          <div className="text-center">
            <div className="text-3xl mb-2">🚫</div>
            <div className="text-lg font-bold mb-2">Must Drag First!</div>
            <div className="text-sm">
              <strong>Step 1:</strong> Drag the icon <Languages className="inline w-4 h-4 mx-1" /> over text<br />
              <strong>Step 2:</strong> Then click the icon to translate
            </div>
          </div>
        </div>
      )}
      

    </>
  );
};

export default FloatingTranslateIcon;
