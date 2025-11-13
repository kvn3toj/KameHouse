import { Box, Typography, Button, Container, Grid, Card, CardContent, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface ValuePropCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValuePropCard({ icon, title, description }: ValuePropCardProps) {
  return (
    <Grid item xs={12} md={4}>
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28 }} />
      <Typography variant="body1">{text}</Typography>
    </Box>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 1,
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={700} color="primary">
                KameHouse
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
              theme.palette.success.main,
              0.05
            )} 100%)`,
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Tu Hogar Fluye Cuando Colaboras
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 6, lineHeight: 1.6, fontWeight: 400 }}
            >
              Convierte las tareas del hogar en un juego cooperativo.
              <br />
              Organiza por espacios, celebra logros juntos.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: '1.25rem',
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                Empieza tu Flujo
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 5, py: 2, fontSize: '1.25rem' }}
              >
                Ya Tengo Cuenta
              </Button>
            </Box>

            {/* Social Proof */}
            <Box sx={{ mt: 6, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  150+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tareas Pre-Configuradas
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipos de Espacios
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  100%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Colaborativo
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Value Propositions */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 2, fontWeight: 700 }}
        >
          ¿Por qué KameHouse?
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
        >
          Transforma tu hogar en un espacio donde todos colaboran naturalmente
        </Typography>

        <Grid container spacing={4}>
          <ValuePropCard
            icon={<HomeIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
            title="Organización por Espacios"
            description="Visualiza tu hogar por habitaciones. Carga presets de tareas específicas para cada espacio. Cocina, sala, baño... todo organizado."
          />
          <ValuePropCard
            icon={<EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main' }} />}
            title="Gamificación Familiar"
            description="Puntos, rachas, niveles. Convierte la limpieza en una aventura cooperativa donde todos ganan juntos."
          />
          <ValuePropCard
            icon={<GroupsIcon sx={{ fontSize: 48, color: 'success.main' }} />}
            title="Flujo Continuo"
            description="Tareas, comidas, eventos... todo sincronizado en un solo lugar. Nada se olvida, todo fluye."
          />
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom fontWeight={700}>
                Todo lo que necesitas para un hogar organizado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                KameHouse integra las mejores prácticas de organización del hogar con mecánicas de
                juego que mantienen a toda la familia motivada.
              </Typography>

              <FeatureItem text="150+ tareas pre-configuradas por tipo de habitación" />
              <FeatureItem text="Sistema de puntos y rachas para motivación continua" />
              <FeatureItem text="Planificador de comidas integrado" />
              <FeatureItem text="Rotación automática de tareas entre miembros" />
              <FeatureItem text="Tablón de anuncios para comunicación familiar" />
              <FeatureItem text="Sistema LETS de intercambio de favores" />

              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/register')}
                sx={{ mt: 4 }}
              >
                Comenzar Ahora
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  p: 4,
                  boxShadow: (theme) => `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" gutterBottom fontWeight={700} color="primary">
                  Nivel 5
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Familia Cooper
                </Typography>
                <Box
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Esta Semana
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    42 Tareas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completadas en equipo
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1), borderRadius: 2, p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Racha Actual
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="warning.main">
                        7 días
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), borderRadius: 2, p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        XP Total
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        2,450
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight={700}>
            ¿Listo para transformar tu hogar?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.25rem' }}>
            Únete a cientos de familias que ya disfrutan de un hogar más organizado y colaborativo
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              px: 6,
              py: 2.5,
              fontSize: '1.25rem',
              boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Crear Mi Cuenta Gratis
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          py: 4,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © 2025 KameHouse - Tu hogar fluye cuando colaboras
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
