import gsap from 'gsap';

export interface ServiceItem {
  title: string;
  description: string;
  image: string;
  id: string;
  categories: string[];
}

export interface Location {
  name: string;
}

export interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  date: string;
  text: string;
}

export type AnimationContext = gsap.Context | null;