import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  CloudDownload,
  Compass,
  Crosshair,
  Crown,
  Droplets,
  Eye,
  Globe,
  Info,
  Layers,
  LocateFixed,
  Mail,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  Mountain,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Upload,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';

export type IconName =
  | 'alert'
  | 'arrow-left'
  | 'arrow-right'
  | 'bookmark'
  | 'book-open'
  | 'calendar'
  | 'camera'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'clock'
  | 'cloud'
  | 'cloud-download'
  | 'compass'
  | 'crosshair'
  | 'crown'
  | 'droplets'
  | 'eye'
  | 'globe'
  | 'info'
  | 'layers'
  | 'locate'
  | 'mail'
  | 'map'
  | 'map-pin'
  | 'maximize'
  | 'minimize'
  | 'moon'
  | 'mountain'
  | 'pause'
  | 'play'
  | 'plus'
  | 'rotate-ccw'
  | 'rotate-cw'
  | 'search'
  | 'send'
  | 'shield-check'
  | 'sliders'
  | 'smartphone'
  | 'sparkles'
  | 'star'
  | 'sun'
  | 'upload'
  | 'user'
  | 'volume-2'
  | 'volume-x'
  | 'x';

const ICON_MAP = {
  alert: AlertTriangle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bookmark: Bookmark,
  'book-open': BookOpen,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  clock: Clock,
  cloud: Cloud,
  'cloud-download': CloudDownload,
  compass: Compass,
  crosshair: Crosshair,
  crown: Crown,
  droplets: Droplets,
  eye: Eye,
  globe: Globe,
  info: Info,
  layers: Layers,
  locate: LocateFixed,
  mail: Mail,
  map: MapIcon,
  'map-pin': MapPin,
  maximize: Maximize2,
  minimize: Minimize2,
  moon: Moon,
  mountain: Mountain,
  pause: Pause,
  play: Play,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  'rotate-cw': RotateCw,
  search: Search,
  send: Send,
  'shield-check': ShieldCheck,
  sliders: Sliders,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  upload: Upload,
  user: User,
  'volume-2': Volume2,
  'volume-x': VolumeX,
  x: X,
} as const;

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

export function AppIcon({
  name,
  size = 16,
  color = '#F1F5FC',
  fill = 'none',
  strokeWidth = 1.8,
}: AppIconProps) {
  const IconComponent = ICON_MAP[name];
  return <IconComponent size={size} color={color} fill={fill} strokeWidth={strokeWidth} />;
}
