import React from 'react'

const BlinkingDot = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-3 h-3">
        {/* Blinking Dot */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 mb-1 mr-2 bg-green-500"></span>
      </div>

    </div>
  );
};

export default BlinkingDot;

