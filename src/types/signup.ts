export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  address: string;
  notifications: boolean;
  marketing: boolean;
}

export type StepVideo = {
  step: number;
  title: string;
  subtitle: string;
  type: 'video';
  sources: { src: string; type: string }[];
  poster?: string;
};

export type StepImage = {
  step: number;
  title: string;
  subtitle: string;
  type: 'image';
  src: string;
};

export type StepMedia = StepVideo | StepImage;
