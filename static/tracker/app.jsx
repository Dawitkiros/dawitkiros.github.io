const { useState, useEffect, useCallback, useRef } = React;

function getTrackerConfig() {
  const cfg = window.TRACKER_CONFIG || {};
  return {
    supabaseUrl: cfg.SUPABASE_URL || cfg.supabaseUrl || "",
    supabaseAnonKey: cfg.SUPABASE_ANON_KEY || cfg.supabaseAnonKey || "",
    allowedEmails: String(cfg.ALLOWED_EMAIL || cfg.allowedEmail || "")
      .split(/[;,]/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    tableName: cfg.TABLE_NAME || cfg.tableName || "tracker_kv",
  };
}

const TRACKER_CONFIG = getTrackerConfig();
const SUPABASE_READY = Boolean(
  TRACKER_CONFIG.supabaseUrl &&
  TRACKER_CONFIG.supabaseAnonKey &&
  window.supabase &&
  typeof window.supabase.createClient === "function"
);

const localStorageBackend = {
  mode: "local",
  get: async (key) => {
    const value = window.localStorage.getItem(key);
    return value === null ? null : { value };
  },
  set: async (key, value) => {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  },
};

function createSupabaseBackend(client, userId) {
  return {
    mode: "supabase",
    get: async (key) => {
      const { data, error } = await client
        .from(TRACKER_CONFIG.tableName)
        .select("value")
        .eq("user_id", userId)
        .eq("key", key)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data ? { value: JSON.stringify(data.value) } : null;
    },
    set: async (key, value) => {
      if (value === null) {
        const { error } = await client
          .from(TRACKER_CONFIG.tableName)
          .delete()
          .eq("user_id", userId)
          .eq("key", key);
        if (error) throw error;
        return;
      }

      const { error } = await client
        .from(TRACKER_CONFIG.tableName)
        .upsert(
          {
            user_id: userId,
            key,
            value: JSON.parse(value),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,key" }
        );

      if (error) throw error;
    },
  };
}
// ─── PROGRAM DATA ───────────────────────────────────────────────────────────
const PHASES = [
  { weeks: [1,2,3], name: "Foundation", mainSets: 3, mainReps: "10–12", mainRIR: "3–2", accSets: 2, accReps: "12–15", accRIR: "2–3", coreSets: 3 },
  { weeks: [4], name: "Deload", mainSets: 2, mainReps: "10–12", mainRIR: "4–5", accSets: 1, accReps: "12–15", accRIR: "4–5", coreSets: 2 },
  { weeks: [5,6,7], name: "Build", mainSets: 4, mainReps: "8–10", mainRIR: "2", accSets: 3, accReps: "10–12", accRIR: "2", coreSets: 3 },
  { weeks: [8], name: "Deload", mainSets: 2, mainReps: "8–10", mainRIR: "4–5", accSets: 1, accReps: "10–12", accRIR: "4–5", coreSets: 2 },
  { weeks: [9,10,11], name: "Strength", mainSets: 3, mainReps: "6–8", mainRIR: "1–2", accSets: 3, accReps: "8–12", accRIR: "1–2", coreSets: 3 },
  { weeks: [12], name: "Consolidate", mainSets: 2, mainReps: "6–8", mainRIR: "2", accSets: 2, accReps: "8–12", accRIR: "2", coreSets: 2 },
];

function getPhase(week) {
  return PHASES.find(p => p.weeks.includes(week)) || PHASES[0];
}

const WORKOUTS = {
  A: {
    title: "Workout A",
    subtitle: "Squat + Push/Pull",
    color: "#E8726E",
    exercises: [
      { id: "a1", name: "Leg Press / Goblet Squat", type: "main", cue: "Feet flat, knees track toes, brace core", emoji: "🦵" },
      { id: "a2", name: "DB Romanian Deadlift", type: "main", cue: "Soft knees, hips back, feel hamstrings", emoji: "🏋️" },
      { id: "a3", name: "Machine Chest Press / DB Bench", type: "main", cue: "Shoulder blades back/down, don't bounce", emoji: "💪" },
      { id: "a4", name: "Lat Pulldown", type: "main", cue: "Pull elbows to ribs, don't shrug", emoji: "🔽" },
      { id: "a5", name: "DB Lateral Raise", type: "acc", cue: "Light weight, control the movement", emoji: "🪽" },
      { id: "a6", name: "Cable Face Pull / Reverse Fly", type: "acc", cue: "Light weight, stop before form breaks", emoji: "🔄" },
      { id: "a7", name: "Dead Bug", type: "core", cue: "Slow exhale, ribs down", repsOverride: "6–10/side" },
      { id: "a8", name: "Front Plank", type: "core", cue: "Don't let lower back arch", repsOverride: "25–45s" },
    ]
  },
  B: {
    title: "Workout B",
    subtitle: "Glutes/Single-Leg + Pull",
    color: "#6E9FE8",
    exercises: [
      { id: "b1", name: "Hip Thrust / Glute Bridge", type: "main", cue: "Chin tucked, ribs down, pause 1s at top", emoji: "🍑" },
      { id: "b2", name: "DB Split Squat / Lunge", type: "main", cue: "Controlled descent, push through mid-foot", emoji: "🦿" },
      { id: "b3", name: "Seated Cable Row", type: "main", cue: "Pull to lower ribs, keep neck long", emoji: "🚣" },
      { id: "b4", name: "Machine Shoulder Press", type: "main", cue: "Ribs down, press up and slightly back", emoji: "⬆️" },
      { id: "b5", name: "Cable Triceps Pressdown", type: "acc", cue: "Elbows pinned, squeeze at bottom", emoji: "💎" },
      { id: "b6", name: "DB Curls / Cable Curls", type: "acc", cue: "Control the negative, no swinging", emoji: "💪" },
      { id: "b7", name: "Pallof Press", type: "core", cue: "Tall posture, resist rotation", repsOverride: "10–12/side" },
      { id: "b8", name: "Suitcase Carry", type: "core", cue: "Don't lean, ribs over pelvis", repsOverride: "20–40m/side" },
    ]
  }
};

const WEEK_SCHEDULE = {
  Mon: "A", Wed: "B",
  Tue: "swim", Sat: "swim",
};

const STEPS_TARGETS = {
  1: 7000, 2: 8000, 3: 8500, 4: 9000,
  5: 9000, 6: 9500, 7: 10000, 8: 10000,
  9: 10000, 10: 10500, 11: 11000, 12: 12000,
};

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  workoutLogs: "fit12-workoutLogs",
  dailyLogs: "fit12-dailyLogs",
  settings: "fit12-settings",
};

async function loadData(key, backend) {
  try {
    const r = await backend.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}

async function saveData(key, val, backend) {
  try {
    if (val === null) {
      await backend.set(key, null);
    } else {
      await backend.set(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error("Save failed", e);
  }
}

// ─── UTILITIES ──────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekNumber(startDate) {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function hasRecoveryHash() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  return params.get("type") === "recovery";
}

const RESET_FLOW_KEY = "tracker-password-reset-pending";
const RESET_QUERY_PARAM = "mode";
const RESET_QUERY_VALUE = "reset-password";
const RESET_FLOW_TTL_MS = 60 * 60 * 1000;

function hasResetQueryFlag() {
  const params = new URLSearchParams(window.location.search || "");
  return params.get(RESET_QUERY_PARAM) === RESET_QUERY_VALUE;
}

function setResetFlowPending() {
  try {
    window.localStorage.setItem(RESET_FLOW_KEY, String(Date.now()));
  } catch (_) {}
}

function clearResetFlowPending() {
  try {
    window.localStorage.removeItem(RESET_FLOW_KEY);
  } catch (_) {}
}

function hasResetFlowPending() {
  try {
    const raw = window.localStorage.getItem(RESET_FLOW_KEY);
    if (!raw) return false;

    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) {
      window.localStorage.removeItem(RESET_FLOW_KEY);
      return false;
    }

    if (Date.now() - timestamp > RESET_FLOW_TTL_MS) {
      window.localStorage.removeItem(RESET_FLOW_KEY);
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

function clearRecoveryUrlState() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete(RESET_QUERY_PARAM);
  const cleanPath = `${url.pathname}${url.search}`;
  window.history.replaceState({}, document.title, cleanPath);
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [settings, setSettings] = useState({ startDate: null, name: "" });
  const [dailyLogs, setDailyLogs] = useState({});
  const [workoutLogs, setWorkoutLogs] = useState({});
  const [activeWorkout, setActiveWorkout] = useState(null);

  const [authClient, setAuthClient] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(
    hasRecoveryHash() || hasResetQueryFlag() || hasResetFlowPending()
  );
  const passwordSignInInProgressRef = useRef(false);

  const [backend, setBackend] = useState(localStorageBackend);

  useEffect(() => {
    if (hasRecoveryHash() || hasResetQueryFlag()) {
      setResetFlowPending();
    }
  }, []);

  useEffect(() => {
    if (!SUPABASE_READY) return;

    const client = window.supabase.createClient(
      TRACKER_CONFIG.supabaseUrl,
      TRACKER_CONFIG.supabaseAnonKey
    );
    setAuthClient(client);

    let mounted = true;

    client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setAuthSession(data.session || null);
      setRequiresPasswordReset(
        Boolean(data.session) && (hasRecoveryHash() || hasResetQueryFlag() || hasResetFlowPending())
      );
      setAuthReady(true);
    });

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      setAuthSession(session || null);

      if (event === "PASSWORD_RECOVERY") {
        setResetFlowPending();
        setRequiresPasswordReset(true);
        setAuthError("");
        setAuthNotice("Set a new password to continue.");
        return;
      }

      if (event === "SIGNED_IN" && passwordSignInInProgressRef.current) {
        clearResetFlowPending();
        clearRecoveryUrlState();
        setRequiresPasswordReset(false);
      }

      if (event === "SIGNED_IN" && (hasRecoveryHash() || hasResetQueryFlag() || hasResetFlowPending())) {
        setResetFlowPending();
        setRequiresPasswordReset(true);
        setAuthError("");
        setAuthNotice("Set a new password to continue.");
        return;
      }

      if (event === "USER_UPDATED") {
        clearResetFlowPending();
        clearRecoveryUrlState();
        setRequiresPasswordReset(false);
      }

      if (event === "SIGNED_OUT") {
        clearResetFlowPending();
        clearRecoveryUrlState();
        setRequiresPasswordReset(false);
      }

      setAuthError("");
      setAuthNotice("");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authClient && authSession && authSession.user && authSession.user.id) {
      setBackend(createSupabaseBackend(authClient, authSession.user.id));
    }
  }, [authClient, authSession]);

  useEffect(() => {
    if (!authSession || !authSession.user || !authSession.user.id || requiresPasswordReset) return;

    let cancelled = false;
    setLoaded(false);

    (async () => {
      const s = await loadData(STORAGE_KEYS.settings, backend);
      const d = await loadData(STORAGE_KEYS.dailyLogs, backend);
      const w = await loadData(STORAGE_KEYS.workoutLogs, backend);

      if (cancelled) return;

      setSettings(s || { startDate: null, name: "" });
      setDailyLogs(d || {});
      setWorkoutLogs(w || {});
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [backend, authSession, requiresPasswordReset]);

  const updateSettings = useCallback(async (s) => {
    setSettings(s);
    await saveData(STORAGE_KEYS.settings, s, backend);
  }, [backend]);

  const updateDailyLogs = useCallback(async (d) => {
    setDailyLogs(d);
    await saveData(STORAGE_KEYS.dailyLogs, d, backend);
  }, [backend]);

  const updateWorkoutLogs = useCallback(async (w) => {
    setWorkoutLogs(w);
    await saveData(STORAGE_KEYS.workoutLogs, w, backend);
  }, [backend]);

  const isAllowedEmail = useCallback((email) => {
    if (!TRACKER_CONFIG.allowedEmails.length) return true;
    return TRACKER_CONFIG.allowedEmails.includes(email);
  }, []);

  const sendMagicLink = useCallback(async (emailInput) => {
    if (!authClient) return;

    const email = (emailInput || "").trim().toLowerCase();
    if (!email) {
      setAuthError("Please enter your email.");
      return;
    }

    if (!isAllowedEmail(email)) {
      setAuthError("This tracker is restricted to the invited email.");
      return;
    }

    const { error } = await authClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/tracker/`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setAuthError(error.message);
      setAuthNotice("");
      return;
    }

    setAuthError("");
    setAuthNotice(`Magic link sent to ${email}. Open it on this device to sign in.`);
  }, [authClient, isAllowedEmail]);

  const signInWithPassword = useCallback(async (emailInput, passwordInput) => {
    if (!authClient) return;

    const email = (emailInput || "").trim().toLowerCase();
    const password = passwordInput || "";

    if (!email) {
      setAuthError("Please enter your email.");
      return;
    }

    if (!isAllowedEmail(email)) {
      setAuthError("This tracker is restricted to the invited email.");
      return;
    }

    if (!password) {
      setAuthError("Please enter your password.");
      return;
    }

    passwordSignInInProgressRef.current = true;
    try {
      const { error } = await authClient.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthError(error.message);
        setAuthNotice("");
        return;
      }

      clearResetFlowPending();
      clearRecoveryUrlState();
      setRequiresPasswordReset(false);
      setAuthError("");
      setAuthNotice("");
    } finally {
      passwordSignInInProgressRef.current = false;
    }
  }, [authClient, isAllowedEmail]);

  const sendPasswordReset = useCallback(async (emailInput) => {
    if (!authClient) return;

    const email = (emailInput || "").trim().toLowerCase();
    if (!email) {
      setAuthError("Please enter your email.");
      return;
    }

    if (!isAllowedEmail(email)) {
      setAuthError("This tracker is restricted to the invited email.");
      return;
    }

    const { error } = await authClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/tracker/?${RESET_QUERY_PARAM}=${RESET_QUERY_VALUE}`,
    });

    if (error) {
      setAuthError(error.message);
      setAuthNotice("");
      return;
    }

    setResetFlowPending();
    setAuthError("");
    setAuthNotice(`Password reset email sent to ${email}. Follow the link to set a password.`);
  }, [authClient, isAllowedEmail]);

  const completePasswordReset = useCallback(async (newPassword, confirmPassword) => {
    if (!authClient) return;

    const password = newPassword || "";
    const confirm = confirmPassword || "";

    if (!password) {
      setAuthError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setAuthError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    const { error } = await authClient.auth.updateUser({ password });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthError("");
    setAuthNotice("Password updated successfully.");
    clearResetFlowPending();
    setRequiresPasswordReset(false);
    clearRecoveryUrlState();
  }, [authClient]);

  const signOut = useCallback(async () => {
    if (authClient) {
      await authClient.auth.signOut();
    }

    setLoaded(false);
    setSettings({ startDate: null, name: "" });
    setDailyLogs({});
    setWorkoutLogs({});
    setTab("today");
  }, [authClient]);

  if (!SUPABASE_READY) {
    return <SecureSetupScreen />;
  }

  if (!authReady) {
    return <LoadingScreen message="Preparing secure tracker…" />;
  }

  if (!authSession) {
    return (
      <AuthScreen
        onSignInWithPassword={signInWithPassword}
        onSendLink={sendMagicLink}
        onSendPasswordReset={sendPasswordReset}
        errorMessage={authError}
        noticeMessage={authNotice}
      />
    );
  }

  if (requiresPasswordReset) {
    return (
      <PasswordRecoveryScreen
        onUpdatePassword={completePasswordReset}
        errorMessage={authError}
        noticeMessage={authNotice}
      />
    );
  }

  if (!loaded) return <LoadingScreen message="Syncing your data…" />;
  if (!settings.startDate) return <OnboardingScreen onComplete={updateSettings} />;
  if (activeWorkout) return (
    <WorkoutSession
      workoutKey={activeWorkout}
      week={getWeekNumber(settings.startDate)}
      workoutLogs={workoutLogs}
      onSave={async (log) => {
        const key = `${todayStr()}-${activeWorkout}`;
        const next = { ...workoutLogs, [key]: log };
        await updateWorkoutLogs(next);
        setActiveWorkout(null);
      }}
      onCancel={() => setActiveWorkout(null)}
    />
  );

  const week = getWeekNumber(settings.startDate);
  const phase = getPhase(week);

  return (
    <div style={styles.app}>
      {tab === "today" && (
        <TodayView
          settings={settings}
          week={week}
          phase={phase}
          dailyLogs={dailyLogs}
          workoutLogs={workoutLogs}
          onUpdateDaily={updateDailyLogs}
          onStartWorkout={setActiveWorkout}
        />
      )}
      {tab === "plan" && <PlanView week={week} phase={phase} />}
      {tab === "progress" && (
        <ProgressView dailyLogs={dailyLogs} workoutLogs={workoutLogs} settings={settings} />
      )}
      {tab === "settings" && (
        <SettingsView
          settings={settings}
          authEmail={authSession.user.email || ""}
          onUpdate={updateSettings}
          onSignOut={signOut}
          onReset={async () => {
            await saveData(STORAGE_KEYS.settings, null, backend);
            await saveData(STORAGE_KEYS.dailyLogs, null, backend);
            await saveData(STORAGE_KEYS.workoutLogs, null, backend);
            setSettings({ startDate: null, name: "" });
            setDailyLogs({});
            setWorkoutLogs({});
          }}
        />
      )}
      <NavBar tab={tab} onTab={setTab} />
    </div>
  );
}

function SecureSetupScreen() {
  return (
    <div style={styles.app}>
      <div style={{ ...styles.card, marginTop: 32 }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.text, margin: "0 0 10px" }}>
          Secure Setup Required
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 1.5 }}>
          Configure Supabase in <code>/tracker/config.js</code> before using this tracker.
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
          Then create the secure table and RLS policies from <code>/tracker/supabase.sql</code>.
        </p>
      </div>
    </div>
  );
}

function AuthScreen({ onSignInWithPassword, onSendLink, onSendPasswordReset, errorMessage, noticeMessage }) {
  const [email, setEmail] = useState(TRACKER_CONFIG.allowedEmails[0] || "");
  const [password, setPassword] = useState("");

  return (
    <div style={styles.app}>
      <div style={{ padding: "60px 24px 24px" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.text, margin: "0 0 8px" }}>
          Private Gym Tracker
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 1.5, marginBottom: 24 }}>
          Sign in with email and password. Use magic link if you prefer passwordless access.
        </p>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={{ ...styles.label, marginTop: 14 }}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage ? (
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: 10 }}>{errorMessage}</p>
        ) : null}
        {noticeMessage ? (
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.success, marginTop: 10 }}>{noticeMessage}</p>
        ) : null}

        <button style={{ ...styles.btnPrimary, marginTop: 16 }} onClick={() => onSignInWithPassword(email, password)}>
          Sign In With Password
        </button>

        <button
          style={{ ...styles.btnOutline, width: "100%", marginTop: 10 }}
          onClick={() => onSendLink(email)}
        >
          Send Magic Link
        </button>

        <button
          style={{ ...styles.backBtn, marginTop: 12 }}
          onClick={() => onSendPasswordReset(email)}
        >
          Forgot password? Send reset email
        </button>
      </div>
    </div>
  );
}

function PasswordRecoveryScreen({ onUpdatePassword, errorMessage, noticeMessage }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div style={styles.app}>
      <div style={{ padding: "60px 24px 24px" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🔑</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.text, margin: "0 0 8px" }}>
          Set New Password
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 1.5, marginBottom: 24 }}>
          This reset link is valid. Set a new password before accessing your tracker.
        </p>

        <label style={styles.label}>New Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={{ ...styles.label, marginTop: 14 }}>Confirm Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {errorMessage ? (
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: 10 }}>{errorMessage}</p>
        ) : null}
        {noticeMessage ? (
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.success, marginTop: 10 }}>{noticeMessage}</p>
        ) : null}

        <button
          style={{ ...styles.btnPrimary, marginTop: 16 }}
          onClick={() => onUpdatePassword(password, confirmPassword)}
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

// ─── LOADING ────────────────────────────────────────────────────────────────
function LoadingScreen({ message = "Loading…" }) {
  return (
    <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️‍♀️</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text }}>{message}</div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ─────────────────────────────────────────────────────────────
function OnboardingScreen({ onComplete }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(todayStr());

  return (
    <div style={styles.app}>
      <div style={{ padding: "60px 24px 24px", flex: 1 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.text, margin: "0 0 6px" }}>
          Welcome!
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, margin: "0 0 32px", lineHeight: 1.5 }}>
          Let's set up your 12‑week training plan. You'll train 2× per week with full-body workouts, plus swimming and walking.
        </p>

        <label style={styles.label}>Your name</label>
        <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sara" />

        <label style={{ ...styles.label, marginTop: 20 }}>Program start date</label>
        <input style={styles.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <button
          style={{ ...styles.btnPrimary, marginTop: 32, opacity: name ? 1 : 0.4 }}
          disabled={!name}
          onClick={() => onComplete({ name, startDate })}
        >
          Start My Plan →
        </button>
      </div>
    </div>
  );
}

// ─── TODAY VIEW ─────────────────────────────────────────────────────────────
function TodayView({ settings, week, phase, dailyLogs, workoutLogs, onUpdateDaily, onStartWorkout }) {
  const today = todayStr();
  const log = dailyLogs[today] || {};
  const dayName = new Date().toLocaleDateString("en", { weekday: "short" });
  const scheduledWorkout = WEEK_SCHEDULE[dayName];
  const todayWorkoutDone = workoutLogs[`${today}-A`] || workoutLogs[`${today}-B`];
  const stepsTarget = STEPS_TARGETS[week] || 10000;

  const updateToday = (field, val) => {
    const next = { ...dailyLogs, [today]: { ...log, [field]: val } };
    onUpdateDaily(next);
  };

  return (
    <div style={styles.scrollContainer}>
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1.2 }}>
          Week {week} of 12 · {phase.name}
        </p>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.text, margin: "0 0 4px" }}>
          Hey {settings.name} ✨
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Phase info card */}
      <div style={{ ...styles.card, background: `linear-gradient(135deg, ${colors.warmBg}, ${colors.card})`, border: `1px solid ${colors.border}` }}>
        <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.accent, fontWeight: 600, marginBottom: 6 }}>
          📋 Current Phase: {phase.name}
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>
          Main lifts: {phase.mainSets} sets × {phase.mainReps} reps @ RIR {phase.mainRIR}<br />
          Accessories: {phase.accSets} sets × {phase.accReps} reps @ RIR {phase.accRIR}
        </div>
      </div>

      {/* Today's scheduled activity */}
      {scheduledWorkout && scheduledWorkout !== "swim" && !todayWorkoutDone && (
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <button
            style={{
              ...styles.btnPrimary,
              background: WORKOUTS[scheduledWorkout].color,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
            onClick={() => onStartWorkout(scheduledWorkout)}
          >
            <span style={{ fontSize: 20 }}>▶</span>
            Start {WORKOUTS[scheduledWorkout].title}
          </button>
        </div>
      )}

      {!scheduledWorkout || scheduledWorkout === "swim" ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{scheduledWorkout === "swim" ? "🏊" : "🚶"}</div>
          <div style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text }}>
            {scheduledWorkout === "swim" ? "Swim Day" : "Active Recovery"}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            {scheduledWorkout === "swim"
              ? "Easy/moderate pace, 30–45 min. Focus on enjoyment."
              : "Walk, stretch, rest. Keep those steps up!"}
          </div>
        </div>
      ) : null}

      {todayWorkoutDone && (
        <div style={{ ...styles.card, textAlign: "center", background: colors.successBg }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
          <div style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.success }}>Workout done!</div>
        </div>
      )}

      {/* Quick-start buttons for any workout */}
      <div style={{ padding: "0 20px", marginBottom: 8 }}>
        <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
          Start a workout
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {["A", "B"].map(k => (
            <button key={k} onClick={() => onStartWorkout(k)} style={{
              ...styles.btnOutline,
              flex: 1,
              borderColor: WORKOUTS[k].color,
              color: WORKOUTS[k].color,
            }}>
              {WORKOUTS[k].title.replace("Workout ", "")} – {WORKOUTS[k].subtitle}
            </button>
          ))}
        </div>
      </div>

      {/* Daily logging */}
      <div style={{ padding: "12px 20px 0" }}>
        <p style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.text, margin: "0 0 12px" }}>
          Daily Check-in
        </p>
      </div>

      {/* Weight */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>⚖️</span>
            <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Body Weight</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              style={{ ...styles.inputSmall, width: 70, textAlign: "center" }}
              type="number" step="0.1" placeholder="kg"
              value={log.weight || ""}
              onChange={e => updateToday("weight", e.target.value ? parseFloat(e.target.value) : "")}
            />
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>kg</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>👟</span>
            <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Steps</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              style={{ ...styles.inputSmall, width: 80, textAlign: "center" }}
              type="number" step="500" placeholder="steps"
              value={log.steps || ""}
              onChange={e => updateToday("steps", e.target.value ? parseInt(e.target.value) : "")}
            />
          </div>
        </div>
        <StepsBar current={log.steps || 0} target={stepsTarget} />
      </div>

      {/* Protein */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>🥩</span>
            <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Protein Target</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["✅ Hit", "❌ Missed"].map(opt => {
              const val = opt.includes("Hit") ? "yes" : "no";
              const active = log.protein === val;
              return (
                <button key={val} onClick={() => updateToday("protein", val)} style={{
                  ...styles.chip,
                  background: active ? (val === "yes" ? colors.success : colors.danger) : colors.inputBg,
                  color: active ? "#fff" : colors.textMuted,
                  border: "none",
                }}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Swimming */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>🏊</span>
            <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Swimming</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ label: "None", val: "" }, { label: "Easy", val: "easy" }, { label: "Moderate", val: "moderate" }].map(opt => {
              const active = (log.swim || "") === opt.val;
              return (
                <button key={opt.val} onClick={() => updateToday("swim", opt.val)} style={{
                  ...styles.chip,
                  background: active ? colors.accent : colors.inputBg,
                  color: active ? "#fff" : colors.textMuted,
                  border: "none",
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Energy & mood */}
      <div style={styles.card}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 18, marginRight: 8 }}>⚡</span>
          <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Energy Level</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => updateToday("energy", n)} style={{
              width: 36, height: 36, borderRadius: 10,
              border: "none",
              background: log.energy === n ? colors.accent : colors.inputBg,
              color: log.energy === n ? "#fff" : colors.textMuted,
              fontFamily: fonts.body, fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={styles.card}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 18, marginRight: 8 }}>📝</span>
          <span style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.text }}>Notes</span>
        </div>
        <textarea
          style={{ ...styles.input, minHeight: 60, resize: "vertical" }}
          placeholder="How do you feel today?"
          value={log.notes || ""}
          onChange={e => updateToday("notes", e.target.value)}
        />
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

function StepsBar({ current, target }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
        <span>{current.toLocaleString()}</span>
        <span>Target: {target.toLocaleString()}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: colors.inputBg, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          background: pct >= 100 ? colors.success : colors.accent,
          width: `${pct}%`,
          transition: "width 0.4s ease"
        }} />
      </div>
    </div>
  );
}

// ─── WORKOUT SESSION ────────────────────────────────────────────────────────
function WorkoutSession({ workoutKey, week, workoutLogs, onSave, onCancel }) {
  const workout = WORKOUTS[workoutKey];
  const phase = getPhase(week);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = warmup
  const [showCue, setShowCue] = useState(null);
  const scrollRef = useRef(null);

  // Load previous session data for reference
  const prevKey = Object.keys(workoutLogs).filter(k => k.endsWith(`-${workoutKey}`)).sort().pop();
  const prevLog = prevKey ? workoutLogs[prevKey] : null;

  const exercises = workout.exercises;
  const currentEx = currentIdx >= 0 ? exercises[currentIdx] : null;

  function getSetsCount(ex) {
    if (ex.type === "main") return phase.mainSets;
    if (ex.type === "acc") return phase.accSets;
    return phase.coreSets;
  }

  function getTargetReps(ex) {
    if (ex.repsOverride) return ex.repsOverride;
    if (ex.type === "main") return phase.mainReps;
    if (ex.type === "acc") return phase.accReps;
    return "8–12";
  }

  function getRIR(ex) {
    if (ex.type === "main") return phase.mainRIR;
    if (ex.type === "acc") return phase.accRIR;
    return "2–3";
  }

  function updateSet(exId, setIdx, field, value) {
    setExerciseLogs(prev => {
      const exLog = prev[exId] || { sets: [] };
      const sets = [...exLog.sets];
      sets[setIdx] = { ...(sets[setIdx] || {}), [field]: value };
      return { ...prev, [exId]: { ...exLog, sets } };
    });
  }

  const allDone = exercises.every((ex, i) => {
    const log = exerciseLogs[ex.id];
    const nSets = getSetsCount(ex);
    return log && log.sets && log.sets.filter(s => s && (s.reps || s.time)).length >= nSets;
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIdx]);

  // Warmup view
  if (currentIdx === -1) {
    return (
      <div style={styles.app}>
        <div style={styles.scrollContainer} ref={scrollRef}>
          <div style={{ padding: "20px 20px 0" }}>
            <button onClick={onCancel} style={styles.backBtn}>← Back</button>
            <h1 style={{ fontFamily: fonts.heading, fontSize: 22, color: workout.color, margin: "12px 0 4px" }}>
              {workout.title}
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
              Week {week} · {phase.name} Phase
            </p>
          </div>

          <div style={{ ...styles.card, background: colors.warmBg }}>
            <h3 style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.text, margin: "0 0 12px" }}>
              🔥 Warm-up (5–10 min)
            </h3>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 1.8 }}>
              1. 5 min easy incline walk / bike / row<br />
              2. 8 bodyweight squats<br />
              3. 8 hip hinges (hands on hips, push hips back)<br />
              4. 10 band pull-aparts (or very light face pulls)<br />
              5. 8 slow dead bugs or 20s plank
            </div>
          </div>

          <div style={{ padding: "0 20px" }}>
            <button
              style={{ ...styles.btnPrimary, background: workout.color }}
              onClick={() => setCurrentIdx(0)}
            >
              Warm-up Done — Let's Go! 💪
            </button>
          </div>
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  // Exercise view
  return (
    <div style={styles.app}>
      <div style={styles.scrollContainer} ref={scrollRef}>
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => currentIdx > 0 ? setCurrentIdx(currentIdx - 1) : setCurrentIdx(-1)} style={styles.backBtn}>
              ← {currentIdx === 0 ? "Warm-up" : "Prev"}
            </button>
            <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>
              {currentIdx + 1} / {exercises.length}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4, padding: "8px 20px", flexWrap: "wrap" }}>
          {exercises.map((ex, i) => {
            const log = exerciseLogs[ex.id];
            const done = log && log.sets && log.sets.filter(s => s && (s.reps || s.time)).length >= getSetsCount(ex);
            return (
              <button key={i} onClick={() => setCurrentIdx(i)} style={{
                width: 28, height: 6, borderRadius: 3, border: "none", cursor: "pointer",
                background: i === currentIdx ? workout.color : done ? colors.success : colors.inputBg,
                opacity: i === currentIdx ? 1 : 0.7,
              }} />
            );
          })}
        </div>

        {currentEx && (
          <div style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 28 }}>{currentEx.emoji || "🏋️"}</span>
              <div>
                <h2 style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text, margin: 0 }}>
                  {currentEx.name}
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, margin: "2px 0 0" }}>
                  {getSetsCount(currentEx)} sets × {getTargetReps(currentEx)} {currentEx.type !== "core" ? `@ RIR ${getRIR(currentEx)}` : ""}
                </p>
              </div>
            </div>

            {/* Form cue */}
            <button onClick={() => setShowCue(showCue === currentEx.id ? null : currentEx.id)}
              style={{ ...styles.chip, background: colors.warmBg, color: colors.accent, border: "none", marginBottom: 12, fontSize: 12, padding: "6px 12px" }}>
              💡 Form Cue {showCue === currentEx.id ? "▲" : "▼"}
            </button>
            {showCue === currentEx.id && (
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.accent, background: colors.warmBg, padding: "10px 14px", borderRadius: 10, marginBottom: 12, lineHeight: 1.5 }}>
                {currentEx.cue}
              </div>
            )}

            {/* Previous session reference */}
            {prevLog && prevLog[currentEx.id] && (
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: 12, background: colors.inputBg, padding: "8px 12px", borderRadius: 8 }}>
                📊 Last time: {prevLog[currentEx.id].sets.map((s, i) =>
                  s ? `${s.weight || "-"}kg×${s.reps || s.time || "-"}` : null
                ).filter(Boolean).join(" · ")}
              </div>
            )}

            {/* Set logging */}
            <div style={{ marginBottom: 16 }}>
              {Array.from({ length: getSetsCount(currentEx) }).map((_, si) => {
                const setData = (exerciseLogs[currentEx.id]?.sets || [])[si] || {};
                const isCore = currentEx.type === "core";
                return (
                  <div key={si} style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                    padding: "10px 12px", background: colors.card, borderRadius: 12,
                    border: `1px solid ${setData.reps || setData.time ? colors.success + "40" : colors.border}`,
                  }}>
                    <span style={{
                      fontFamily: fonts.heading, fontSize: 13, color: colors.textMuted,
                      width: 32, textAlign: "center",
                    }}>
                      S{si + 1}
                    </span>
                    {!isCore ? (
                      <>
                        <input
                          style={{ ...styles.inputSmall, flex: 1, textAlign: "center" }}
                          type="number" step="0.5" placeholder="kg"
                          value={setData.weight ?? ""}
                          onChange={e => updateSet(currentEx.id, si, "weight", e.target.value)}
                        />
                        <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>×</span>
                        <input
                          style={{ ...styles.inputSmall, width: 50, textAlign: "center" }}
                          type="number" placeholder="reps"
                          value={setData.reps ?? ""}
                          onChange={e => updateSet(currentEx.id, si, "reps", e.target.value)}
                        />
                      </>
                    ) : (
                      <input
                        style={{ ...styles.inputSmall, flex: 1, textAlign: "center" }}
                        placeholder={currentEx.repsOverride || "reps or time"}
                        value={setData.time ?? ""}
                        onChange={e => updateSet(currentEx.id, si, "time", e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nav */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {currentIdx < exercises.length - 1 ? (
                <button
                  style={{ ...styles.btnPrimary, background: workout.color, flex: 1 }}
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  Next Exercise →
                </button>
              ) : (
                <button
                  style={{ ...styles.btnPrimary, background: colors.success, flex: 1 }}
                  onClick={() => onSave(exerciseLogs)}
                >
                  ✅ Finish Workout
                </button>
              )}
            </div>
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

// ─── PLAN VIEW ──────────────────────────────────────────────────────────────
function PlanView({ week, phase }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={styles.scrollContainer}>
      <div style={{ padding: "20px 20px 0" }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.text, margin: "0 0 4px" }}>
          Your Plan
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: "0 0 16px" }}>
          Week {week} · {phase.name} Phase
        </p>
      </div>

      {/* Weekly schedule */}
      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text, margin: "0 0 10px" }}>Weekly Schedule</h3>
        {[
          { day: "Mon", activity: "Workout A", icon: "🏋️", clr: WORKOUTS.A.color },
          { day: "Tue", activity: "Swim / Walk", icon: "🏊", clr: colors.accent },
          { day: "Wed", activity: "Workout B", icon: "🏋️", clr: WORKOUTS.B.color },
          { day: "Thu", activity: "Rest", icon: "😌", clr: colors.textMuted },
          { day: "Fri", activity: "Rest", icon: "😌", clr: colors.textMuted },
          { day: "Sat", activity: "Swim / Walk", icon: "🚶", clr: colors.accent },
          { day: "Sun", activity: "Rest", icon: "😌", clr: colors.textMuted },
        ].map(d => (
          <div key={d.day} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
            borderBottom: `1px solid ${colors.border}`,
            opacity: d.activity === "Rest" ? 0.5 : 1,
          }}>
            <span style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.textMuted, width: 36 }}>{d.day}</span>
            <span style={{ fontSize: 16 }}>{d.icon}</span>
            <span style={{ fontFamily: fonts.body, fontSize: 14, color: d.clr, fontWeight: 500 }}>{d.activity}</span>
          </div>
        ))}
      </div>

      {/* Workout details */}
      {["A", "B"].map(k => {
        const w = WORKOUTS[k];
        const isOpen = expanded === k;
        return (
          <div key={k} style={{ ...styles.card, borderLeft: `4px solid ${w.color}`, cursor: "pointer" }}
            onClick={() => setExpanded(isOpen ? null : k)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: fonts.heading, fontSize: 16, color: w.color, margin: 0 }}>{w.title}</h3>
                <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, margin: "2px 0 0" }}>{w.subtitle}</p>
              </div>
              <span style={{ fontSize: 18, color: colors.textMuted }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ marginTop: 12 }}>
                {w.exercises.map(ex => (
                  <div key={ex.id} style={{ padding: "8px 0", borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{ex.emoji || "🏋️"}</span>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.text }}>{ex.name}</div>
                        <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                          {ex.type === "main" ? `${phase.mainSets}×${phase.mainReps} @ RIR ${phase.mainRIR}` :
                           ex.type === "acc" ? `${phase.accSets}×${phase.accReps} @ RIR ${phase.accRIR}` :
                           `${phase.coreSets}× ${ex.repsOverride || "8–12"}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.accent, marginTop: 4, paddingLeft: 28 }}>
                      💡 {ex.cue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Progression guide */}
      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text, margin: "0 0 8px" }}>📈 How to Progress</h3>
        <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 1.7 }}>
          Pick a weight you can do at the <b>low end</b> of the rep range with good form. Each session, try to add 1 rep. Once you hit the top of the range for all sets, increase weight slightly (upper: +1–2.5 kg, lower: +2.5–5 kg).
        </div>
      </div>

      {/* Phase overview */}
      <div style={styles.card}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text, margin: "0 0 10px" }}>🗓 12-Week Phases</h3>
        {PHASES.map((p, i) => (
          <div key={i} style={{
            padding: "8px 0", borderBottom: i < PHASES.length - 1 ? `1px solid ${colors.border}` : "none",
            opacity: p.weeks.includes(week) ? 1 : 0.6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 13, color: p.weeks.includes(week) ? colors.accent : colors.text }}>
                {p.weeks.includes(week) ? "→ " : ""}Wk {p.weeks[0]}–{p.weeks[p.weeks.length - 1]}: {p.name}
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                {p.mainSets}×{p.mainReps}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

// ─── PROGRESS VIEW ──────────────────────────────────────────────────────────
function ProgressView({ dailyLogs, workoutLogs, settings }) {
  const entries = Object.entries(dailyLogs)
    .filter(([_, v]) => v.weight)
    .sort(([a], [b]) => a.localeCompare(b));

  const weights = entries.map(([d, v]) => ({ date: d, weight: v.weight }));
  const weeklyAvg = {};
  entries.forEach(([d, v]) => {
    const wk = getWeekNumber(settings.startDate);
    const entryDate = new Date(d + "T12:00:00");
    const start = new Date(settings.startDate);
    const diff = Math.floor((entryDate - start) / (1000 * 60 * 60 * 24));
    const week = Math.max(1, Math.floor(diff / 7) + 1);
    if (!weeklyAvg[week]) weeklyAvg[week] = [];
    weeklyAvg[week].push(v.weight);
  });

  const workoutCount = Object.keys(workoutLogs).length;
  const proteinHits = Object.values(dailyLogs).filter(l => l.protein === "yes").length;
  const totalDays = Object.keys(dailyLogs).length;
  const swimDays = Object.values(dailyLogs).filter(l => l.swim && l.swim !== "").length;

  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const firstWeight = weights.length > 0 ? weights[0].weight : null;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

  // Simple chart
  const chartW = 320;
  const chartH = 140;
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };

  let chartSvg = null;
  if (weights.length >= 2) {
    const wVals = weights.map(w => w.weight);
    const minW = Math.min(...wVals) - 0.5;
    const maxW = Math.max(...wVals) + 0.5;
    const innerW = chartW - padding.left - padding.right;
    const innerH = chartH - padding.top - padding.bottom;
    const xScale = (i) => padding.left + (i / (weights.length - 1)) * innerW;
    const yScale = (v) => padding.top + innerH - ((v - minW) / (maxW - minW)) * innerH;

    const pathD = weights.map((w, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(w.weight)}`).join(" ");
    const areaD = pathD + ` L${xScale(weights.length - 1)},${padding.top + innerH} L${xScale(0)},${padding.top + innerH} Z`;

    chartSvg = (
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", maxWidth: chartW }}>
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[minW, (minW + maxW) / 2, maxW].map((v, i) => (
          <g key={i}>
            <line x1={padding.left} y1={yScale(v)} x2={chartW - padding.right} y2={yScale(v)}
              stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <text x={padding.left - 4} y={yScale(v) + 4} textAnchor="end"
              style={{ fontSize: 10, fill: colors.textMuted, fontFamily: fonts.body }}>
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={areaD} fill="url(#wGrad)" />
        <path d={pathD} fill="none" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(w.weight)} r={3} fill={colors.accent} />
        ))}
        {/* Date labels */}
        {[0, Math.floor(weights.length / 2), weights.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => (
          <text key={i} x={xScale(i)} y={chartH - 2} textAnchor="middle"
            style={{ fontSize: 9, fill: colors.textMuted, fontFamily: fonts.body }}>
            {formatDate(weights[i].date)}
          </text>
        ))}
      </svg>
    );
  }

  return (
    <div style={styles.scrollContainer}>
      <div style={{ padding: "20px 20px 0" }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.text, margin: "0 0 16px" }}>
          Progress
        </h1>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, padding: "0 20px", marginBottom: 16 }}>
        {[
          { label: "Workouts", value: workoutCount, icon: "🏋️" },
          { label: "Swims", value: swimDays, icon: "🏊" },
          { label: "Protein %", value: totalDays > 0 ? Math.round(proteinHits / totalDays * 100) + "%" : "—", icon: "🥩" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, textAlign: "center", padding: "14px 8px",
            background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.text }}>{s.value}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weight summary */}
      {latestWeight && (
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>Current</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, color: colors.text }}>{latestWeight} kg</div>
            </div>
            {weightChange && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>Change</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 22,
                  color: parseFloat(weightChange) <= 0 ? colors.success : colors.danger,
                }}>
                  {parseFloat(weightChange) <= 0 ? "" : "+"}{weightChange} kg
                </div>
              </div>
            )}
          </div>
          {chartSvg}
        </div>
      )}

      {!latestWeight && (
        <div style={{ ...styles.card, textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}>
            Start logging your weight on the Today tab to see progress here!
          </div>
        </div>
      )}

      {/* Weekly averages */}
      {Object.keys(weeklyAvg).length > 0 && (
        <div style={styles.card}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text, margin: "0 0 10px" }}>
            Weekly Averages
          </h3>
          {Object.entries(weeklyAvg).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([wk, vals]) => {
            const avg = (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
            return (
              <div key={wk} style={{
                display: "flex", justifyContent: "space-between", padding: "6px 0",
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>Week {wk}</span>
                <span style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.text }}>{avg} kg ({vals.length} entries)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent workout history */}
      {Object.keys(workoutLogs).length > 0 && (
        <div style={styles.card}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.text, margin: "0 0 10px" }}>
            Recent Workouts
          </h3>
          {Object.entries(workoutLogs).sort(([a], [b]) => b.localeCompare(a)).slice(0, 10).map(([key]) => {
            const [date, wk] = [key.slice(0, 10), key.slice(11)];
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: WORKOUTS[wk]?.color || colors.accent,
                }} />
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.text }}>
                  {WORKOUTS[wk]?.title || `Workout ${wk}`}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginLeft: "auto" }}>
                  {formatDate(date)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}

// ─── SETTINGS VIEW ──────────────────────────────────────────────────────────
function SettingsView({ settings, authEmail, onUpdate, onSignOut, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div style={styles.scrollContainer}>
      <div style={{ padding: "20px 20px 0" }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.text, margin: "0 0 16px" }}>
          Settings
        </h1>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Signed In</label>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text, margin: "0 0 12px" }}>
          {authEmail || "Authenticated user"}
        </p>
        <button onClick={onSignOut} style={styles.btnOutline}>Sign Out</button>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Name</label>
        <input
          style={styles.input}
          value={settings.name}
          onChange={e => onUpdate({ ...settings, name: e.target.value })}
        />
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Program Start Date</label>
        <input
          style={styles.input}
          type="date"
          value={settings.startDate}
          onChange={e => onUpdate({ ...settings, startDate: e.target.value })}
        />
        <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
          Currently on Week {getWeekNumber(settings.startDate)} of 12
        </p>
      </div>

      <div style={{ ...styles.card, background: "#fff5f5" }}>
        <h3 style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.danger, margin: "0 0 8px" }}>
          Reset All Data
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: "0 0 12px" }}>
          This will delete all your workout logs, body weight data, and settings.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{ ...styles.btnOutline, borderColor: colors.danger, color: colors.danger }}
          >
            Reset Everything
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
              style={{ ...styles.btnPrimary, background: colors.danger, flex: 1 }}
            >
              Yes, Delete All
            </button>
            <button onClick={() => setConfirmReset(false)} style={{ ...styles.btnOutline, flex: 1 }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

// ─── NAV BAR ────────────────────────────────────────────────────────────────
function NavBar({ tab, onTab }) {
  const items = [
    { key: "today", label: "Today", icon: "☀️" },
    { key: "plan", label: "Plan", icon: "📋" },
    { key: "progress", label: "Progress", icon: "📊" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderTop: `1px solid ${colors.border}`,
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 env(safe-area-inset-bottom, 12px)",
      zIndex: 100,
    }}>
      {items.map(item => (
        <button key={item.key} onClick={() => onTab(item.key)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "4px 12px",
          opacity: tab === item.key ? 1 : 0.45,
          transform: tab === item.key ? "scale(1.05)" : "scale(1)",
          transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{
            fontFamily: fonts.body, fontSize: 10, fontWeight: 600,
            color: tab === item.key ? colors.accent : colors.textMuted,
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const colors = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  warmBg: "#FFF8F0",
  inputBg: "#F2F0ED",
  border: "#EAE7E2",
  text: "#1A1714",
  textMuted: "#8A847B",
  accent: "#D4703C",
  success: "#4A9D6E",
  successBg: "#E8F5EE",
  danger: "#D4453C",
};

const fonts = {
  heading: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
  body: "'DM Sans', 'SF Pro Text', -apple-system, sans-serif",
};

const styles = {
  app: {
    background: colors.bg,
    minHeight: "100vh",
    maxWidth: 430,
    margin: "0 auto",
    fontFamily: fonts.body,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  scrollContainer: {
    flex: 1,
    overflowY: "auto",
    paddingTop: 12,
    WebkitOverflowScrolling: "touch",
  },
  card: {
    background: colors.card,
    borderRadius: 16,
    padding: "16px",
    margin: "0 20px 12px",
    border: `1px solid ${colors.border}`,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    display: "block",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1.5px solid ${colors.border}`,
    background: colors.inputBg,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    outline: "none",
    boxSizing: "border-box",
    WebkitAppearance: "none",
  },
  inputSmall: {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1.5px solid ${colors.border}`,
    background: colors.inputBg,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    outline: "none",
    boxSizing: "border-box",
    WebkitAppearance: "none",
  },
  btnPrimary: {
    width: "100%",
    padding: "14px 20px",
    borderRadius: 14,
    border: "none",
    background: colors.accent,
    color: "#fff",
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  btnOutline: {
    padding: "10px 16px",
    borderRadius: 12,
    border: `1.5px solid ${colors.border}`,
    background: "transparent",
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  chip: {
    padding: "6px 14px",
    borderRadius: 20,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accent,
    cursor: "pointer",
    padding: 0,
  },
};

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error("Missing #root element for tracker app");
}
ReactDOM.createRoot(rootNode).render(<App />);
