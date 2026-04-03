let globalAudioContext: AudioContext | null = null;

export const playPCMAudio = async (base64Data: string, sampleRate: number = 24000) => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (globalAudioContext.state === 'suspended') {
    await globalAudioContext.resume();
  }

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert Uint8Array to Int16Array
  const int16Data = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(int16Data.length);
  for (let i = 0; i < int16Data.length; i++) {
    float32Data[i] = int16Data[i] / 32768.0;
  }

  const audioBuffer = globalAudioContext.createBuffer(1, float32Data.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Data);

  const source = globalAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(globalAudioContext.destination);
  source.start();
  
  return source;
};
