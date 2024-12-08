export const skipToPhase = async (roomId: string, phase: 'playing' | 'guessing' | 'gameOver') => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch('/api/dev/skip-to-phase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, phase }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to skip phase');
      }
      
      console.log(`Skipped to ${phase} phase`);
    } catch (error) {
      console.error('Error skipping phase:', error);
    }
  }
}; 