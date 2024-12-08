export const Explosion: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Central flash */}
        <div className="absolute inset-0 bg-white animate-[pulse_0.5s_ease-out]" />
        
        {/* Shockwave */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-[ping_1s_ease-out_infinite]" />
        </div>
        
        {/* Particle effects */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-500 rounded-full"
            style={{
              animation: `particle-${i} 1s ease-out forwards`,
              transform: `rotate(${i * 18}deg) translateY(-50px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}; 