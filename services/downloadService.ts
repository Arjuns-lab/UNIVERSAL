
export interface DownloadedVideo {
  id: string;
  title: string;
  posterUrl: string;
  duration: string;
  size: string;
  downloadedAt: string;
  blobId?: string;
}

const METADATA_KEY = 'downloaded_videos';

export const saveVideoMetadata = (metadata: DownloadedVideo) => {
  const existing = getDownloadedVideos();
  const updated = [...existing.filter(v => v.id !== metadata.id), metadata];
  localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
};

export const getDownloadedVideos = (): DownloadedVideo[] => {
  const data = localStorage.getItem(METADATA_KEY);
  return data ? JSON.parse(data) : [];
};

export const removeDownloadedVideo = async (id: string) => {
    const existing = getDownloadedVideos();
    const updated = existing.filter(v => v.id !== id);
    localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    
    try {
        const cache = await caches.open('video-cache');
        const requests = await cache.keys();
        for (const request of requests) {
            if (request.url.includes(id)) {
                await cache.delete(request);
            }
        }
    } catch (e) {
        console.error("Error clearing cache:", e);
    }
};

export const downloadVideo = async (url: string, metadata: DownloadedVideo, onProgress: (progress: number) => void): Promise<void> => {
    try {
        const response = await fetch(url);
        if (!response.body) throw new Error("No body");
        
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        loaded += value.byteLength;
                        if (total) {
                            onProgress((loaded / total) * 100);
                        }
                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });

        const newResponse = new Response(stream, { headers: response.headers });
        const cache = await caches.open('video-cache');
        await cache.put(`/video-cache/${metadata.id}`, newResponse);
        
        saveVideoMetadata({
            ...metadata,
            size: total ? `${(total / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'
        });
        
        onProgress(100);
    } catch (error) {
        console.error("Download failed", error);
        throw error;
    }
};

export const getVideoFromCache = async (id: string): Promise<string | null> => {
    try {
        const cache = await caches.open('video-cache');
        const response = await cache.match(`/video-cache/${id}`);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    } catch (e) {
        console.error("Cache retrieval failed", e);
    }
    return null;
};
