import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

export interface ScheduleConfig {
  scheduledAt?: Date;
  dueDate?: Date;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceData?: {
    interval?: number;
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number;
  };
  timezone?: string;
}

interface SchedulePickerProps {
  value: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'L' }, // Monday
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' }, // Sunday
];

export default function SchedulePicker({ value, onChange, disabled = false }: SchedulePickerProps) {
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(
    value.scheduledAt ? dayjs(value.scheduledAt) : null
  );
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    value.recurrence || 'none'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    value.recurrenceData?.daysOfWeek || []
  );

  const handleDateChange = (newDate: Dayjs | null) => {
    setScheduledAt(newDate);

    const config: ScheduleConfig = {
      scheduledAt: newDate?.toDate(),
      dueDate: newDate ? calculateDueDate(newDate, recurrence) : undefined,
      recurrence,
      recurrenceData: {
        interval: 1,
        daysOfWeek: recurrence === 'weekly' ? selectedDays : undefined,
        dayOfMonth: recurrence === 'monthly' && newDate ? newDate.date() : undefined,
      },
      timezone: 'America/Mexico_City',
    };

    onChange(config);
  };

  const handleRecurrenceChange = (newRecurrence: 'none' | 'daily' | 'weekly' | 'monthly') => {
    setRecurrence(newRecurrence);

    const config: ScheduleConfig = {
      scheduledAt: scheduledAt?.toDate(),
      dueDate: scheduledAt ? calculateDueDate(scheduledAt, newRecurrence) : undefined,
      recurrence: newRecurrence,
      recurrenceData: {
        interval: 1,
        daysOfWeek: newRecurrence === 'weekly' ? selectedDays : undefined,
        dayOfMonth: newRecurrence === 'monthly' && scheduledAt ? scheduledAt.date() : undefined,
      },
      timezone: 'America/Mexico_City',
    };

    onChange(config);
  };

  const handleDaysChange = (event: React.MouseEvent<HTMLElement>, newDays: number[]) => {
    setSelectedDays(newDays);

    const config: ScheduleConfig = {
      scheduledAt: scheduledAt?.toDate(),
      dueDate: scheduledAt ? calculateDueDate(scheduledAt, recurrence) : undefined,
      recurrence,
      recurrenceData: {
        interval: 1,
        daysOfWeek: newDays,
        dayOfMonth: recurrence === 'monthly' && scheduledAt ? scheduledAt.date() : undefined,
      },
      timezone: 'America/Mexico_City',
    };

    onChange(config);
  };

  const calculateDueDate = (startDate: Dayjs, recurrenceType: string): Date => {
    let dueDate = startDate.clone();

    switch (recurrenceType) {
      case 'daily':
        dueDate = dueDate.add(1, 'day');
        break;
      case 'weekly':
        dueDate = dueDate.add(7, 'days');
        break;
      case 'monthly':
        dueDate = dueDate.add(1, 'month');
        break;
      default:
        dueDate = dueDate.add(1, 'day');
    }

    return dueDate.toDate();
  };

  const generateNextOccurrences = (count: number = 5): string[] => {
    if (!scheduledAt || recurrence === 'none') return [];

    const occurrences: string[] = [];
    let currentDate = scheduledAt.clone();

    for (let i = 0; i < count; i++) {
      if (recurrence === 'daily') {
        occurrences.push(currentDate.format('DD MMM YYYY, HH:mm'));
        currentDate = currentDate.add(1, 'day');
      } else if (recurrence === 'weekly') {
        if (selectedDays.length > 0) {
          // Find next occurrence based on selected days
          let found = false;
          let daysChecked = 0;

          while (!found && daysChecked < 14) {
            if (selectedDays.includes(currentDate.day())) {
              occurrences.push(currentDate.format('DD MMM YYYY, HH:mm'));
              found = true;
            }
            currentDate = currentDate.add(1, 'day');
            daysChecked++;
          }
        } else {
          occurrences.push(currentDate.format('DD MMM YYYY, HH:mm'));
          currentDate = currentDate.add(7, 'days');
        }
      } else if (recurrence === 'monthly') {
        occurrences.push(currentDate.format('DD MMM YYYY, HH:mm'));
        currentDate = currentDate.add(1, 'month');
      }
    }

    return occurrences;
  };

  const nextOccurrences = generateNextOccurrences();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          📅 Programar Tarea
        </Typography>

        {/* Date & Time Picker */}
        <Box sx={{ mb: 3 }}>
          <DateTimePicker
            label="Fecha y Hora"
            value={scheduledAt}
            onChange={handleDateChange}
            disabled={disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
              },
            }}
          />
        </Box>

        {/* Recurrence Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Repetir</InputLabel>
          <Select
            value={recurrence}
            onChange={(e) => handleRecurrenceChange(e.target.value as any)}
            label="Repetir"
            disabled={disabled}
          >
            <MenuItem value="none">Una vez</MenuItem>
            <MenuItem value="daily">Diaria</MenuItem>
            <MenuItem value="weekly">Semanal</MenuItem>
            <MenuItem value="monthly">Mensual</MenuItem>
          </Select>
        </FormControl>

        {/* Weekly Day Selector */}
        {recurrence === 'weekly' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Días de la semana
            </Typography>
            <ToggleButtonGroup
              value={selectedDays}
              onChange={handleDaysChange}
              aria-label="días de la semana"
              disabled={disabled}
              sx={{
                display: 'flex',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  flex: 1,
                  border: 1,
                  borderColor: 'divider',
                },
              }}
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleButton
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  {day.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Monthly Day Selector */}
        {recurrence === 'monthly' && scheduledAt && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Se repetirá el día {scheduledAt.date()} de cada mes
            </Typography>
          </Box>
        )}

        {/* Next Occurrences Preview */}
        {recurrence !== 'none' && nextOccurrences.length > 0 && (
          <Paper elevation={0} sx={{ bgcolor: 'grey.100', p: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              ⏰ Próximas ocurrencias:
            </Typography>
            <Stack spacing={0.5}>
              {nextOccurrences.map((occurrence, index) => (
                <Chip
                  key={index}
                  label={`• ${occurrence}`}
                  size="small"
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Stack>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}
