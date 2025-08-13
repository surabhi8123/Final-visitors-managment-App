import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, GestureResponderEvent, PanResponder, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onSave?: (signature: string) => void;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  lineColor?: string;
  lineWidth?: number;
  backgroundColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  style,
  lineColor = '#000000',
  lineWidth = 3,
  backgroundColor = '#ffffff',
}) => {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const viewShotRef = useRef<View>(null);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    // Start a new path when touching the screen
    const newPath = [{ x: locationX, y: locationY }];
    setCurrentPath(newPath);
    // Add the new path to the paths array immediately
    setPaths(prev => [...prev, newPath]);
  }, []);

  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    // Update the current path with the new point
    setCurrentPath(prev => {
      const updatedPath = [...prev, { x: locationX, y: locationY }];
      // Update the last path in the paths array with the updated path
      setPaths(prevPaths => {
        const newPaths = [...prevPaths];
        newPaths[newPaths.length - 1] = updatedPath;
        return newPaths;
      });
      return updatedPath;
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Don't clear currentPath here to keep the last stroke visible
    // The path is already added to paths array in handleTouchStart
  }, []);

  const clearSignature = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    if (onClear) onClear();
  }, [onClear]);

  const saveSignature = useCallback(async () => {
    console.log('saveSignature called');
    
    // Combine all paths including the current path
    const allPaths = [...paths];
    if (currentPath.length > 1) {
      allPaths.push(currentPath);
    }
    
    // Check if there's any signature data to save
    if (allPaths.length === 0) {
      console.warn('No signature to save');
      if (onSave) onSave('');
      return;
    }

    try {
      console.log('Using vector data for signature...');
      
      // Create a simple representation of the signature
      const signatureData = JSON.stringify({
        paths: allPaths,
        lineColor,
        lineWidth,
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'vector'
      });
      
      console.log('Signature data prepared:', signatureData.length > 50 
        ? `${signatureData.substring(0, 50)}...` 
        : signatureData);
      
      if (onSave) {
        onSave(signatureData);
      } else {
        console.error('onSave callback is not defined');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      if (onSave) onSave('');
    }
  }, [paths, currentPath, lineColor, lineWidth, onSave]);

  const renderPath = useCallback((points: Point[], index: number) => {
    if (points.length < 2) return null;
    
    let pathData = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L${points[i].x},${points[i].y}`;
    }
    
    return (
      <Path
        key={`path-${index}`}
        d={pathData}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }, [lineColor, lineWidth]);

  const renderCurrentPath = useCallback(() => {
    if (currentPath.length < 2) return null;
    
    let pathData = `M${currentPath[0].x},${currentPath[0].y}`;
    for (let i = 1; i < currentPath.length; i++) {
      pathData += ` L${currentPath[i].x},${currentPath[i].y}`;
    }

    return (
      <Path
        key="current-path"
        d={pathData}
        stroke={lineColor}
        strokeWidth={lineWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }, [currentPath, lineColor, lineWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
    })
  ).current;

  return (
    <View style={[styles.container, style]}>
      <View 
        ref={viewShotRef}
        collapsable={false}
        style={[styles.drawingSurface, { backgroundColor }]}
        {...panResponder.panHandlers}
      >
        <Svg style={styles.svg}>
          {paths.map((path, index) => renderPath(path, index))}
          {renderCurrentPath()}
        </Svg>
        {(paths.length === 0 && currentPath.length === 0) && (
          <Text style={styles.placeholderText}>Sign here</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearSignature}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveSignature}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 200, // Increased minimum height
    height: 300, // Fixed height for better touch area
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2, // Add shadow for better visual hierarchy
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  drawingSurface: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  svg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    pointerEvents: 'none',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44, // Better touch target size
  },
  clearButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  saveButton: {
    backgroundColor: '#0d6efd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
  },
});

export default React.memo(SignaturePad);