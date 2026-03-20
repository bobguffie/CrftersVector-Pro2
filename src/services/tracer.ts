// @ts-ignore
declare const ImageTracer: any;

export interface TraceOptions {
  colors: number;
  blur: number;
  pathOmit: number;
  ltres: number;
  qtres: number;
  despeckle: number;
  mincolorratio?: number;
  strokewidth: number;
  pal?: { r: number, g: number, b: number, a: number }[];
}

export async function traceImage(imageUrl: string, options: TraceOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const tracerOptions: any = {
          numberofcolors: options.colors,
          blurradius: options.blur,
          pathomit: options.pathOmit,
          ltres: options.ltres,
          qtres: options.qtres,
          despeckle: options.despeckle,
          mincolorratio: options.mincolorratio || 0,
          strokewidth: options.strokewidth,
          viewbox: true,
          linefilter: true,
        };

        if (options.pal) {
          tracerOptions.pal = options.pal;
        }
        
        // Use global ImageTracer from CDN with a callback
        const tracer = (window as any).ImageTracer || ImageTracer;
        if (!tracer) {
          reject(new Error("ImageTracer is not defined. Please check if the script is loaded."));
          return;
        }

        tracer.imageToSVG(
          imageUrl, 
          (svgString: string) => {
            resolve(svgString);
          }, 
          tracerOptions
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for tracing"));
    img.src = imageUrl;
  });
}
