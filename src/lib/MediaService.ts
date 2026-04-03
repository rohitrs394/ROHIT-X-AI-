export class MediaService {
  static async getCameraStream(facingMode: "user" | "environment" = "user"): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser or context.");
      }
      const constraints = {
        video: { facingMode },
        audio: false,
      };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }

  static async getScreenStream(): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported in this browser or context. Try opening the app in a new tab.");
      }
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    } catch (error) {
      console.error("Error accessing screen share:", error);
      throw error;
    }
  }

  static captureScreenshot(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    }
    return "";
  }

  static stopStream(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}
