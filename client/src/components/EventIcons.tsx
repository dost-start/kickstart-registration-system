import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Lightbulb,
  Network,
  Laptop,
  Mail,
  User,
  Phone,
  Facebook,
  GraduationCap,
  MapIcon,
} from "lucide-react";

interface IconWrapperProps {
  children: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const IconWrapper = ({ children, bgColor, iconColor }: IconWrapperProps) => (
  <div
    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bgColor} shadow-sm`}
  >
    <div style={{ color: iconColor }}>{children}</div>
  </div>
);

export const CalendarIcon = (props: React.ComponentProps<typeof Calendar>) => (
  <IconWrapper bgColor="bg-summit-blue/10" iconColor="#4d69ee">
    <Calendar size={20} {...props} />
  </IconWrapper>
);

export const LocationIcon = (props: React.ComponentProps<typeof MapPin>) => (
  <IconWrapper bgColor="bg-summit-teal/10" iconColor="#18d9ce">
    <MapPin size={20} {...props} />
  </IconWrapper>
);

export const TimeIcon = (props: React.ComponentProps<typeof Clock>) => (
  <IconWrapper bgColor="bg-summit-orange/10" iconColor="#fea621">
    <Clock size={20} {...props} />
  </IconWrapper>
);

export const UsersIcon = (props: React.ComponentProps<typeof Users>) => (
  <IconWrapper bgColor="bg-summit-pink/10" iconColor="#fc4c7a">
    <Users size={20} {...props} />
  </IconWrapper>
);

export const InnovationIcon = (
  props: React.ComponentProps<typeof Lightbulb>
) => (
  <IconWrapper bgColor="bg-summit-orange/10" iconColor="#fea621">
    <Lightbulb size={16} {...props} />
  </IconWrapper>
);

export const NetworkIcon = (props: React.ComponentProps<typeof Network>) => (
  <IconWrapper bgColor="bg-summit-orange/10" iconColor="#fea621">
    <Network size={16} {...props} />
  </IconWrapper>
);

export const TechIcon = (props: React.ComponentProps<typeof Laptop>) => (
  <IconWrapper bgColor="bg-summit-orange/10" iconColor="#fea621">
    <Laptop size={16} {...props} />
  </IconWrapper>
);

// Form Icons
export const EmailIcon = (props: React.ComponentProps<typeof Mail>) => (
  <Mail size={18} className="text-summit-blue/60" {...props} />
);

export const PersonIcon = (props: React.ComponentProps<typeof User>) => (
  <User size={18} className="text-summit-blue/60" {...props} />
);

export const PhoneIcon = (props: React.ComponentProps<typeof Phone>) => (
  <Phone size={18} className="text-summit-blue/60" {...props} />
);

export const FacebookIcon = (props: React.ComponentProps<typeof Facebook>) => (
  <Facebook size={18} className="text-summit-blue/60" {...props} />
);

export const UniversityIcon = (
  props: React.ComponentProps<typeof GraduationCap>
) => <GraduationCap size={18} className="text-summit-blue/60" {...props} />;

export const RegionIcon = (props: React.ComponentProps<typeof MapIcon>) => (
  <MapIcon size={18} className="text-summit-blue/60" {...props} />
);
