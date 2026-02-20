import { type LucideProps, HelpCircle } from 'lucide-react';
import * as icons from 'lucide-react';
import { type ComponentType } from 'react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

export default function Icon({ name, className = '', size = 20, ...props }: IconProps) {
  const LucideIcon = (icons as unknown as Record<string, ComponentType<LucideProps>>)[name];
  if (!LucideIcon) {
    return <HelpCircle size={size} className={className} {...props} />;
  }
  return <LucideIcon size={size} className={className} {...props} />;
}
