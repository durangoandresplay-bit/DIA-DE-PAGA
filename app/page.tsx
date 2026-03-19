'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { format, differenceInSeconds, parseISO } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Share2, Edit2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('00:00');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const urlDate = searchParams.get('date');
    if (urlDate) {
      setTargetDate(urlDate);
      localStorage.setItem('payday_date', urlDate);
    } else {
      const localDate = localStorage.getItem('payday_date');
      if (localDate) {
        setTargetDate(localDate);
        router.replace(`/?date=${localDate}`);
      } else {
        setIsEditing(true);
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const target = parseISO(targetDate);
        const diffSeconds = differenceInSeconds(target, now);

        if (diffSeconds <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setTimeLeft({
          days: Math.floor(diffSeconds / (3600 * 24)),
          hours: Math.floor((diffSeconds % (3600 * 24)) / 3600),
          minutes: Math.floor((diffSeconds % 3600) / 60),
          seconds: diffSeconds % 60,
        });
      } catch (e) {
        console.error("Invalid date format");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleSaveDate = () => {
    if (!newDate || !newTime) return;
    const isoString = new Date(`${newDate}T${newTime}:00`).toISOString();
    setTargetDate(isoString);
    localStorage.setItem('payday_date', isoString);
    router.push(`/?date=${isoString}`);
    setIsEditing(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('¡Enlace copiado! Compártelo con tus amigos para que vean este mismo cronómetro.');
  };

  if (!mounted) return null;

  const isPayday = timeLeft && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/30">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="font-bold text-neutral-950 text-xl">$</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Día de Pago</h1>
        </div>
        
        {targetDate && !isEditing && (
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-full transition-colors"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Compartir</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 rounded-full transition-colors"
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Cambiar Fecha</span>
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 pb-32 flex flex-col items-center">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mt-10"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Calendar size={24} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Configurar Fecha</h2>
              <p className="text-neutral-400 text-sm mb-8">Ingresa la fecha y hora de tu próximo pago.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Día de Pago</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Hora Exacta</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSaveDate}
                  disabled={!newDate || !newTime}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Iniciar Cronómetro
                </button>
                {targetDate && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full bg-transparent hover:bg-neutral-800 text-neutral-300 font-medium py-3 rounded-xl transition-colors mt-2"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center w-full mt-10">
            {isPayday ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20"
              >
                <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={64} className="text-emerald-500" />
                </div>
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-4">¡ES DÍA DE PAGO!</h2>
                <p className="text-xl text-emerald-400 font-medium">Hora de celebrar y pagar las cuentas.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase">Día de Paga</h2>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium text-neutral-300 mb-12">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cuenta regresiva hasta el {targetDate ? format(parseISO(targetDate), 'dd/MM/yyyy - HH:mm') : ''}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
                  <TimeUnit value={timeLeft?.days ?? 0} label="Días" />
                  <TimeUnit value={timeLeft?.hours ?? 0} label="Horas" />
                  <TimeUnit value={timeLeft?.minutes ?? 0} label="Minutos" />
                  <TimeUnit value={timeLeft?.seconds ?? 0} label="Segundos" />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-neutral-900/50 border border-neutral-800/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <motion.span 
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-6xl md:text-8xl font-mono font-bold tracking-tighter text-white mb-2"
      >
        {value.toString().padStart(2, '0')}
      </motion.span>
      <span className="text-sm md:text-base font-medium text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function PaydayCountdown() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <CountdownContent />
    </Suspense>
  );
}
