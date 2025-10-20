// Custom Tooltip Component
import { Tooltip } from '@mui/material';

const CustomTooltip = ({ title, children }) => (
  <Tooltip
    title={title}
    arrow
    placement="top"
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
      tooltip: {
        sx: {
          bgcolor: '#000',
          color: '#fff',
          fontSize: '0.8rem',
          borderRadius: 1,
          boxShadow: 1,
        },
      },
    }}
  >
    {children}
  </Tooltip>
);

export default CustomTooltip;
