export interface Project {
  id?: string;
  userId: string;
  name: string;
  svgData: string;
  canvasState: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraceOptions {
  colors: number;
  blur: number;
  pathOmit: number;
  ltres: number;
  qtres: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}
