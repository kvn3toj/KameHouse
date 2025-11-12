import { SvgIconProps } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import { ICONS } from '../../theme/design-system';

type IconName = keyof typeof ICONS;

interface IconProps extends SvgIconProps {
  name: IconName;
}

/**
 * Icon - Unified icon component
 *
 * Use this instead of importing icons directly to ensure consistency
 *
 * Usage:
 * <Icon name="home" />
 * <Icon name="dashboard" fontSize="large" color="primary" />
 */
export const Icon = ({ name, ...props }: IconProps) => {
  const iconName = ICONS[name] as keyof typeof MuiIcons;
  const IconComponent = MuiIcons[iconName] as React.ComponentType<SvgIconProps>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" (${iconName}) not found in Material-UI icons`);
    return <MuiIcons.HelpOutline {...props} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;
