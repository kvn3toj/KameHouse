import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Quick start guide drawer with FAQ and gameplay instructions
 *
 * Features:
 * - Step-by-step getting started guide
 * - Expandable FAQ sections
 * - Gameplay tips
 * - Keyboard shortcuts (if applicable)
 */
export default function HelpDrawer({ open, onClose }: HelpDrawerProps) {
  const steps = [
    {
      icon: <HomeIcon color="primary" />,
      title: 'Create or Join a Household',
      description: 'Start by creating your family household or join an existing one with an invite code.',
      path: '/family',
    },
    {
      icon: <TrophyIcon sx={{ color: '#9C27B0' }} />,
      title: 'Create Your First Habit',
      description: 'Build good routines by creating positive habits. Complete them daily to earn XP and gold!',
      path: '/habits',
    },
    {
      icon: <GroupsIcon sx={{ color: '#2196F3' }} />,
      title: 'Invite Family Members',
      description: 'Share your household invite code so family members can join and collaborate.',
      path: '/family',
    },
    {
      icon: <BankIcon sx={{ color: '#4CAF50' }} />,
      title: 'Trade Favors',
      description: 'Create favor requests and use LETS mutual credit to balance household contributions.',
      path: '/family',
    },
    {
      icon: <TrendingUpIcon sx={{ color: '#FF9800' }} />,
      title: 'Level Up & Unlock Achievements',
      description: 'Complete habits, earn XP to level up, and unlock spectacular achievements!',
      path: '/achievements',
    },
  ];

  const faqs = [
    {
      question: 'What is LETS mutual credit?',
      answer:
        "LETS (Local Exchange Trading System) is a favor trading economy where credits are created when favors are exchanged. When you complete a favor for someone, you earn credits and they owe credits. Everyone starts at 0 and balances fluctuate as favors are traded. It's a way to track household contributions fairly!",
    },
    {
      question: 'How do XP and levels work?',
      answer:
        'Complete habits to earn XP (experience points). As you accumulate XP, you level up! Higher difficulty habits reward more XP. Leveling up unlocks achievements and shows your dedication to building good routines.',
    },
    {
      question: 'What are achievements?',
      answer:
        'Achievements are special milestones you unlock by completing habits, maintaining streaks, leveling up, and contributing to your household. Each achievement comes with XP, gold, and sometimes gem rewards. They celebrate your progress!',
    },
    {
      question: 'How do habit streaks work?',
      answer:
        'A streak is the number of consecutive days you complete a habit. The longer your streak, the more motivated you stay! Breaking a streak resets it to 0, so consistency is key.',
    },
    {
      question: 'Can I use this without internet?',
      answer:
        "Yes! KameHouse is designed for local WiFi networks. As long as all devices are on the same network, you don't need internet. Perfect for privacy and home use!",
    },
    {
      question: 'How do I invite family members?',
      answer:
        'Go to the Family page, find your household invite code, and share it with family members. They can enter the code when joining to become part of your household.',
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            <Typography variant="h5" fontWeight={700}>
              Quick Start Guide
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close help">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <Typography variant="body1" fontWeight={600} gutterBottom>
              🏠 Welcome to KameHouse!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              KameHouse is a gamified household management system that makes chores, habits, and family
              collaboration fun! Follow these steps to get started.
            </Typography>
          </Box>
        </motion.div>

        {/* Getting Started Steps */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Getting Started
        </Typography>
        <List sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Step ${index + 1}`} size="small" color="primary" />
                      <Typography variant="body1" fontWeight={600}>
                        {step.title}
                      </Typography>
                    </Box>
                  }
                  secondary={step.description}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        {/* FAQ Section */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ mb: 3 }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <Accordion
                sx={{
                  mb: 1,
                  background: 'rgba(255, 255, 255, 0.02)',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" fontWeight={600}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>

        {/* Tips Section */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
          }}
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            💡 Pro Tips
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Complete habits daily to build streaks and maximize XP</li>
            <li>Higher difficulty habits reward more XP and gold</li>
            <li>Keep your LETS balance fair by completing favors promptly</li>
            <li>Check achievements regularly to track your progress</li>
            <li>Invite family members to make household management collaborative</li>
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Need more help? Check the Family page for household management or visit Achievements to see your
            progress.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
