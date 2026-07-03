import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import gsap from 'gsap';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // GSAP Animation Hooks
  const pageRef = useRef(null);
  const convoyRef = useRef(null);
  const wheelsRef = useRef([]);
  const cardRef = useRef(null);
  const backgroundNutsRef = useRef([]);
  const cargoNutsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const isMobile = window.innerWidth < 1024;

      if (!isMobile) {
        //  Slower, Dramatic Entry
        gsap.fromTo(convoyRef.current,
          { x: '100vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 4,
            ease: 'power4.out',
            onComplete: () => {
              wheelsRef.current.forEach(wheel => {
                if (wheel) gsap.to(wheel, { animationPlayState: 'paused', duration: 0.5 });
              });
            }
          }
        );


        cargoNutsRef.current.forEach((nut) => {
          if (!nut) return;
          gsap.to(nut, {
            y: `-=${gsap.utils.random(2, 4)}`,
            rotation: gsap.utils.random(-3, 3),
            duration: gsap.utils.random(1.2, 1.8),
            repeat: -1, yoyo: true, ease: 'sine.inOut',
          });
        });
      } else {
        // Mobile: just fade card in
        gsap.fromTo(cardRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
        );
      }

      //  Background nuts float — both layouts
      backgroundNutsRef.current.forEach((nut, index) => {
        if (!nut) return;
        gsap.to(nut, {
          y: `-=${gsap.utils.random(30, 60)}`,
          x: `+=${gsap.utils.random(15, 40)}`,
          rotation: gsap.utils.random(25, 75),
          duration: gsap.utils.random(7, 11),
          repeat: -1, yoyo: true, ease: 'sine.inOut', delay: index * 0.25,
        });
      });

      //  Mouse parallax — both layouts
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const moveX = (clientX / window.innerWidth) - 0.5;
        const moveY = (clientY / window.innerHeight) - 0.5;
        backgroundNutsRef.current.forEach((nut) => {
          if (!nut) return;
          const speed = nut.classList.contains('bg-size-massive') ? 110 : 55;
          gsap.to(nut, {
            x: moveX * speed, y: moveY * speed,
            duration: 1.8, ease: 'power2.out', overwrite: 'auto',
          });
        });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);

    }, pageRef);

    return () => ctx.revert();
  }, []);

  function change(field, val) {
    setForm(p => ({ ...p, [field]: val }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill all fields');
    if (mode === 'register' && !form.name) return setError('Name is required');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login(form.email, form.password)
        : await authAPI.register(form.name, form.email, form.password);
      login(res.data.user, res.data.access_token);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    }
    setLoading(false);
  }

  function googleLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/google`;
  }

  return (
    <div className="login__page" ref={pageRef}>

      {/* --- MASSIVE BACKGROUND FLOATING DRY FRUITS LAYER --- */}
      <div className="login__background-ambiance">
        <img src="/dryfruits/almond.png"    className="floating-nut bg-size-massive bg-blur-heavy  pos-1" ref={el => backgroundNutsRef.current[0] = el} alt="" />
        <img src="/dryfruits/cashew.png"    className="floating-nut bg-size-large  bg-blur-light   pos-2" ref={el => backgroundNutsRef.current[1] = el} alt="" />
        <img src="/dryfruits/walnut.png"    className="floating-nut bg-size-massive bg-blur-medium pos-3" ref={el => backgroundNutsRef.current[2] = el} alt="" />
        <img src="/dryfruits/pistachio.png" className="floating-nut bg-size-large                  pos-4" ref={el => backgroundNutsRef.current[3] = el} alt="" />
        <img src="/dryfruits/dates.png"     className="floating-nut bg-size-massive bg-blur-heavy  pos-5" ref={el => backgroundNutsRef.current[4] = el} alt="" />
        <img src="/dryfruits/fig.png"       className="floating-nut bg-size-large                  pos-6" ref={el => backgroundNutsRef.current[5] = el} alt="" />
        <img src="/dryfruits/raisins.png"   className="floating-nut bg-size-massive bg-blur-medium pos-7" ref={el => backgroundNutsRef.current[6] = el} alt="" />
      </div>

      {/* --- MAIN VEHICLE CONVOY LINE (desktop only) --- */}
      <div className="login__convoy-container" ref={convoyRef}>

        {/* 1. TRUCK CABIN */}
        <div className="truck__cabin">
          <div className="truck__windshield" />
          <div className="truck__ev-lightbar" />
          <div className="truck__brand">🌿Nutresa</div>
          <div className="truck__wheel wheel__pos-left" ref={el => wheelsRef.current[0] = el}>
            <div className="truck__wheel-inner" />
          </div>
          <div className="truck__wheel wheel__pos-right" ref={el => wheelsRef.current[1] = el}>
            <div className="truck__wheel-inner" />
          </div>
        </div>

        {/* LINK 1 */}
        <div className="truck__hitch-chain" />

        {/* 2. TRAILER BED */}
        <div className="truck__trailer">
          <div className="trailer__pile-container">
            <img src="/dryfruits/walnut.png"    className="cargo-item item-walnut-bg"        ref={el => cargoNutsRef.current[0] = el} alt="" />
            <img src="/dryfruits/almond.png"    className="cargo-item item-almond-l"         ref={el => cargoNutsRef.current[1] = el} alt="" />
            <img src="/dryfruits/cashew.png"    className="cargo-item item-cashew-c"         ref={el => cargoNutsRef.current[2] = el} alt="" />
            <img src="/dryfruits/pumpkin.png"   className="cargo-item item-walnut-top"       ref={el => cargoNutsRef.current[3] = el} alt="" />
            <img src="/dryfruits/pistachio.png" className="cargo-item item-pistachio-r"      ref={el => cargoNutsRef.current[4] = el} alt="" />
            <img src="/dryfruits/dates.png"     className="cargo-item item-dates-edge"       ref={el => cargoNutsRef.current[5] = el} alt="" />
            <img src="/dryfruits/fig.png"       className="cargo-item item-fig-front"        ref={el => cargoNutsRef.current[6] = el} alt="" />
            <img src="/dryfruits/sunflower.png" className="cargo-item item-sunflower-accent" ref={el => cargoNutsRef.current[7] = el} alt="" />
          </div>
          <div className="trailer__label">ORGANIC CARGO</div>
          <div className="truck__wheel wheel__pos-t1" ref={el => wheelsRef.current[2] = el}><div className="truck__wheel-inner" /></div>
          <div className="truck__wheel wheel__pos-t2" ref={el => wheelsRef.current[3] = el}><div className="truck__wheel-inner" /></div>
          <div className="truck__wheel wheel__pos-t3" ref={el => wheelsRef.current[4] = el}><div className="truck__wheel-inner" /></div>
          <div className="truck__wheel wheel__pos-t4" ref={el => wheelsRef.current[5] = el}><div className="truck__wheel-inner" /></div>
        </div>

        {/* LINK 2 */}
        <div className="truck__hitch-chain long-link" />

        {/* 3. LOGIN CARD */}
        <div className="login__card" ref={cardRef}>
          <div className="login__logo">
            <div className="login__logo-icon">🌿</div>
            <span className="login__logo-name">Nutresa</span>
          </div>
          <h1 className="login__title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="login__subtitle">{mode === 'login' ? 'Log in to your account' : 'Join Nutresa for a healthier lifestyle'}</p>

          <button type="button" className="login__google-btn" onClick={googleLogin}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login__divider">
            <div className="login__divider-line"/>
            <span className="login__divider-text">or email</span>
            <div className="login__divider-line"/>
          </div>

          {error && <div className="login__error-box">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => change('name', e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => change('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => change('password', e.target.value)} placeholder="Min 6 characters" />
            </div>
            <button type="submit" className="login__submit-btn" disabled={loading}>
              {loading ? '⏳ Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="login__switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="login__switch-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setForm({ name: '', email: '', password: '' }); }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>

      <div className="login__roadway" />
    </div>
  );
}