import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeStep from './WelcomeStep';
import RoomSelectionStep from './RoomSelectionStep';
import TaskPresetsStep from './TaskPresetsStep';
import FirstMissionStep from './FirstMissionStep';
import CompletionStep from './CompletionStep';

interface OnboardingFlowProps {
  open: boolean;
  householdId: string;
  onComplete: () => void;
}

const steps = [
  'Bienvenida',
  'Configura Espacios',
  'Carga Tareas Preset',
  'Primera Misión',
  'Completado',
];

export default function OnboardingFlow({
  open,
  householdId,
  onComplete,
}: OnboardingFlowProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [createdRooms, setCreatedRooms] = useState<any[]>([]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleRoomsSelected = (rooms: string[]) => {
    setSelectedRooms(rooms);
    handleNext();
  };

  const handleRoomsCreated = (rooms: any[]) => {
    setCreatedRooms(rooms);
    handleNext();
  };

  const handleMissionComplete = () => {
    handleNext();
  };

  const handleFinish = () => {
    // Mark onboarding as complete
    localStorage.setItem('kh_onboarding_complete', 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          minHeight: '600px',
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ width: '100%' }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400, position: 'relative' }}>
            <AnimatePresence mode="wait" custom={activeStep}>
              <motion.div
                key={activeStep}
                custom={activeStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                style={{ position: 'absolute', width: '100%' }}
              >
                {activeStep === 0 && <WelcomeStep onNext={handleNext} />}
                {activeStep === 1 && (
                  <RoomSelectionStep
                    onNext={handleRoomsSelected}
                    onBack={handleBack}
                  />
                )}
                {activeStep === 2 && (
                  <TaskPresetsStep
                    householdId={householdId}
                    selectedRooms={selectedRooms}
                    onNext={handleRoomsCreated}
                    onBack={handleBack}
                  />
                )}
                {activeStep === 3 && (
                  <FirstMissionStep
                    rooms={createdRooms}
                    onNext={handleMissionComplete}
                    onBack={handleBack}
                  />
                )}
                {activeStep === 4 && (
                  <CompletionStep onFinish={handleFinish} />
                )}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
