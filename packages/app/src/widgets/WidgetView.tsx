import type { Widget } from '../types';
import { Fader } from './Fader';
import { Button } from './Button';
import { XYPad } from './XYPad';
import { ColorPickerWidget } from './ColorPickerWidget';
import { Dropdown } from './Dropdown';
import { Label } from './Label';

export function WidgetView({
  widget,
  interactive,
}: {
  widget: Widget;
  interactive: boolean;
}) {
  switch (widget.type) {
    case 'fader':
      return <Fader widget={widget} interactive={interactive} />;
    case 'button':
      return <Button widget={widget} interactive={interactive} />;
    case 'xypad':
      return <XYPad widget={widget} interactive={interactive} />;
    case 'colorpicker':
      return <ColorPickerWidget widget={widget} interactive={interactive} />;
    case 'dropdown':
      return <Dropdown widget={widget} interactive={interactive} />;
    case 'label':
      return <Label widget={widget} />;
    default:
      return null;
  }
}
