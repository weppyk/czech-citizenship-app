import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private basePath = '/assets/images/questions/';
  private loadedImages = new Set<string>();
  private preloadedImages = new Map<string, HTMLImageElement>();

  getImageUrl(filename: string): string {
    return `${this.basePath}${filename}`;
  }

  async preloadImage(filename: string): Promise<void> {
    const url = this.getImageUrl(filename);

    if (this.preloadedImages.has(url)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.set(url, img);
        this.loadedImages.add(url);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  async preloadImages(filenames: string[]): Promise<void> {
    const promises = filenames.map(filename => this.preloadImage(filename));
    await Promise.allSettled(promises);
  }

  isImageLoaded(filename: string): boolean {
    const url = this.getImageUrl(filename);
    return this.loadedImages.has(url);
  }

  clearCache(): void {
    this.preloadedImages.clear();
    this.loadedImages.clear();
  }
}
