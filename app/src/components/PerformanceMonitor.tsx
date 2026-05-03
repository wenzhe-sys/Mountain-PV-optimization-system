import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isVisibleRef = useRef(false);

  // Calculate FPS
  useEffect(() => {
    const calculateFPS = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      frameCountRef.current++;
      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCountRef.current * 1000) / elapsed)
        }));
        frameCountRef.current = 0;
        lastTimeRef.current = timestamp;
      }
      
      requestAnimationFrame(calculateFPS);
    };

    const animationId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
        }));
      }
    }, 5000);

    return () => clearInterval(memoryInterval);
  }, []);

  // Calculate page load time
  useEffect(() => {
    if (performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({
        ...prev,
        loadTime: loadTime / 1000
      }));
    }
  }, []);

  // Monitor render time
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'render') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    return () => observer.disconnect();
  }, []);

  // Toggle visibility on click
  const toggleVisibility = () => {
    isVisibleRef.current = !isVisibleRef.current;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Toggle performance metrics"
      >
        ⚡
      </button>
      
      {isVisibleRef.current && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white p-3 rounded-lg shadow-lg w-64">
          <h3 className="font-semibold mb-2 text-sm">Performance Metrics</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={`${metrics.fps > 30 ? 'text-green-400' : metrics.fps > 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Memory (MB):</span>
              <span className={metrics.memory < 500 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.memory}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Load Time (s):</span>
              <span className={metrics.loadTime < 3 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.loadTime.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Render Time (ms):</span>
              <span className={metrics.renderTime < 16 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.renderTime.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;