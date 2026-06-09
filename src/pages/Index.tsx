import { useState, useRef, useCallback, useEffect } from "react";

const LABELS = [
  "Родилась", "1 месяц", "2 месяца", "3 месяца",
  "4 месяца", "5 месяцев", "6 месяцев", "7 месяцев",
  "8 месяцев", "9 месяцев", "10 месяцев", "11 месяцев",
];

const POSITIONS: { col: number; row: number; idx: number }[] = [
  { col: 0, row: 0, idx: 0 },
  { col: 1, row: 0, idx: 1 },
  { col: 2, row: 0, idx: 2 },
  { col: 3, row: 0, idx: 3 },
  { col: 3, row: 2, idx: 4 },
  { col: 3, row: 3, idx: 5 },
  { col: 3, row: 4, idx: 6 },
  { col: 2, row: 6, idx: 7 },
  { col: 1, row: 6, idx: 8 },
  { col: 0, row: 4, idx: 9 },
  { col: 0, row: 3, idx: 10 },
  { col: 0, row: 2, idx: 11 },
];

interface PhotoState {
  src: string;
  x: number; // offset % from center
  y: number;
  scale: number;
}

// Inner component: oval with drag + pinch/wheel zoom
function OvalPhoto({
  photo, onLoad, size = "small"
}: {
  photo: PhotoState | null;
  onLoad: () => void;
  size?: "small" | "large";
}) {
  const [pos, setPos] = useState({ x: 0, y: 0, scale: 1.6 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const prevDist = useRef<number | null>(null);

  // Reset position when new photo loaded
  useEffect(() => {
    if (photo) setPos({ x: photo.x, y: photo.y, scale: photo.scale });
  }, [photo?.src]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!photo) return;
    e.preventDefault();
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !photo) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setPos(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
  }, [photo]);

  const onMouseUp = () => { dragging.current = false; };

  const onWheel = (e: React.WheelEvent) => {
    if (!photo) return;
    e.preventDefault();
    setPos(p => ({ ...p, scale: Math.min(5, Math.max(1, p.scale - e.deltaY * 0.005)) }));
  };

  // Touch drag + pinch
  const onTouchStart = (e: React.TouchEvent) => {
    if (!photo) return;
    if (e.touches.length === 1) {
      last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      prevDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!photo) return;
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - last.current.x;
      const dy = e.touches[0].clientY - last.current.y;
      last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPos(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
    } else if (e.touches.length === 2 && prevDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - prevDist.current;
      prevDist.current = dist;
      setPos(p => ({ ...p, scale: Math.min(5, Math.max(1, p.scale + delta * 0.01)) }));
    }
  };

  const onTouchEnd = () => { prevDist.current = null; };

  if (!photo) return null;

  return (
    <div
      ref={frameRef}
      className={size === "large" ? "crop-area-large" : "crop-area"}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ cursor: "grab", userSelect: "none" }}
    >
      <img
        src={photo.src}
        alt=""
        className="crop-img"
        style={{
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${pos.scale})`,
          transformOrigin: "center center",
        }}
        onLoad={onLoad}
        draggable={false}
      />
      <div className="crop-hint">↔ двигай · 🔍 зум</div>
    </div>
  );
}

export default function Index() {
  const [photos, setPhotos] = useState<(PhotoState | null)[]>(Array(13).fill(null));
  const [babyName, setBabyName] = useState("Анюта");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("Анюта");
  const [birthDate, setBirthDate] = useState("11.06.2025");
  const [weight, setWeight] = useState("3470 г");
  const [birthTime, setBirthTime] = useState("18:50");
  const [editingField, setEditingField] = useState<"date" | "weight" | "time" | null>(null);
  const [fieldInput, setFieldInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const openPhoto = (idx: number) => {
    setActiveSlot(idx);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev => prev.map((p, i) =>
        i === activeSlot
          ? { src: ev.target?.result as string, x: 0, y: 0, scale: 1.6 }
          : p
      ));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [activeSlot]);

  const saveField = () => {
    if (editingField === "date") setBirthDate(fieldInput);
    if (editingField === "weight") setWeight(fieldInput);
    if (editingField === "time") setBirthTime(fieldInput);
    setEditingField(null);
  };

  return (
    <div className="poster-root">
      <div className="hearts-layer" aria-hidden="true">
        {[5,12,20,28,38,48,55,62,70,78,85,92,8,18,35,52,72,88].map((l, i) => (
          <span key={i} className="deco-heart" style={{
            left: `${l}%`,
            top: `${[8,22,5,14,3,18,7,25,10,4,20,12,60,70,65,75,68,55][i]}%`,
            fontSize: `${[10,14,8,12,10,16,8,11,9,13,10,8,12,9,14,10,11,8][i]}px`,
            animationDelay: `${i * 0.3}s`,
          }}>♥</span>
        ))}
      </div>

      <div className="flower-corner tl" aria-hidden="true" />
      <div className="flower-corner tr" aria-hidden="true" />
      <div className="flower-corner bl" aria-hidden="true" />
      <div className="flower-corner br" aria-hidden="true" />

      <div className="poster-inner">
        <div className="photo-layout">

          {POSITIONS.map(({ col, row, idx }) => (
            <div
              key={idx}
              className="oval-slot"
              style={{ gridColumn: col + 1, gridRow: row + 1 }}
            >
              <div className="oval-frame" onClick={photos[idx] ? undefined : () => openPhoto(idx)}>
                {photos[idx] ? (
                  <OvalPhoto photo={photos[idx]} onLoad={() => {}} size="small" />
                ) : (
                  <div className="oval-empty"><span className="oval-cam">📷</span></div>
                )}
              </div>
              <div className="oval-actions">
                <div className="oval-label">{LABELS[idx]}</div>
                <button className="oval-change-btn" onClick={() => openPhoto(idx)} title="Загрузить фото">
                  {photos[idx] ? "✎" : "+"}
                </button>
              </div>
            </div>
          ))}

          {/* Central large oval */}
          <div className="center-slot" style={{ gridColumn: "2 / 4", gridRow: "1 / 6" }}>
            <div className="center-frame" onClick={photos[12] ? undefined : () => openPhoto(12)}>
              {photos[12] ? (
                <OvalPhoto photo={photos[12]} onLoad={() => {}} size="large" />
              ) : (
                <div className="center-empty">
                  <span className="center-cam">📷</span>
                  <span className="center-hint">Главное фото</span>
                </div>
              )}
            </div>
            {photos[12] && (
              <button className="center-change-btn" onClick={() => openPhoto(12)}>✎ Заменить</button>
            )}
          </div>

          {/* Name block */}
          <div className="name-block" style={{ gridColumn: "2 / 4", gridRow: "5 / 8" }}>
            {editingName ? (
              <div className="name-edit-wrap">
                <input
                  className="name-inp"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { setBabyName(nameInput || "Имя"); setEditingName(false); }
                  }}
                  autoFocus
                  maxLength={20}
                />
                <button className="name-ok" onClick={() => { setBabyName(nameInput || "Имя"); setEditingName(false); }}>✓</button>
              </div>
            ) : (
              <h1 className="name-title" onClick={() => { setEditingName(true); setNameInput(babyName); }}
                title="Нажмите, чтобы изменить имя">{babyName}</h1>
            )}
            <p className="name-sub">Первый годик</p>
            <div className="name-heart">♥</div>
          </div>

        </div>

        {/* Bottom info */}
        <div className="info-bar">
          <div className="info-item" onClick={() => { setEditingField("date"); setFieldInput(birthDate); }}>
            <span className="info-icon">📅</span>
            <div className="info-content">
              {editingField === "date"
                ? <input className="info-inp" value={fieldInput} onChange={e => setFieldInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveField()} onBlur={saveField} autoFocus />
                : <span className="info-val">{birthDate}</span>
              }
              <span className="info-lbl">Дата рождения</span>
            </div>
          </div>
          <div className="info-sep" />
          <div className="info-item" onClick={() => { setEditingField("weight"); setFieldInput(weight); }}>
            <span className="info-icon">⚖️</span>
            <div className="info-content">
              {editingField === "weight"
                ? <input className="info-inp" value={fieldInput} onChange={e => setFieldInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveField()} onBlur={saveField} autoFocus />
                : <span className="info-val">{weight}</span>
              }
              <span className="info-lbl">Вес при рождении</span>
            </div>
          </div>
          <div className="info-sep" />
          <div className="info-item" onClick={() => { setEditingField("time"); setFieldInput(birthTime); }}>
            <span className="info-icon">🕐</span>
            <div className="info-content">
              {editingField === "time"
                ? <input className="info-inp" value={fieldInput} onChange={e => setFieldInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveField()} onBlur={saveField} autoFocus />
                : <span className="info-val">{birthTime}</span>
              }
              <span className="info-lbl">Время рождения</span>
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}
