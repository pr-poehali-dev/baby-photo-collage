import { useState, useRef, useCallback } from "react";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const CONFETTI_ITEMS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 14 + 6,
  color: [
    "#FF6B6B", "#FFE66D", "#4ECDC4", "#FF8B94",
    "#A8E6CF", "#FFB347", "#C9B1FF", "#FF6B9D",
    "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
  ][i % 12],
  rotation: Math.random() * 360,
  shape: i % 3,
  animDelay: Math.random() * 8,
  animDuration: Math.random() * 4 + 5,
}));

const STARS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 20 + 10,
  animDelay: Math.random() * 5,
  color: ["#FFE66D", "#FFB347", "#FF6B6B", "#C9B1FF", "#4ECDC4"][i % 5],
}));

const BALLOONS = ["🎈", "🎀", "🎊", "🎉", "🌟", "✨", "💫", "🎶", "🎈", "🎀"];

interface PhotoSlot {
  month: number;
  image: string | null;
}

export default function Index() {
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    MONTHS.map((_, i) => ({ month: i, image: null }))
  );
  const [babyName, setBabyName] = useState("Имя малыша");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("Имя малыша");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const handleSlotClick = (idx: number) => {
    setActiveSlot(idx);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev =>
        prev.map((p, i) =>
          i === activeSlot ? { ...p, image: ev.target?.result as string } : p
        )
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [activeSlot]);

  const handleNameSave = () => {
    setBabyName(nameInput.trim() || "Имя малыша");
    setEditingName(false);
  };

  return (
    <div className="collage-root">
      {/* Animated background particles */}
      <div className="bg-layer" aria-hidden="true">
        {CONFETTI_ITEMS.map(c => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              top: `${c.top}%`,
              width: c.shape === 0 ? c.size : c.size * 0.55,
              height: c.shape === 0 ? c.size * 0.45 : c.size,
              background: c.color,
              borderRadius: c.shape === 2 ? "50%" : c.shape === 1 ? "2px" : "3px",
              transform: `rotate(${c.rotation}deg)`,
              animationDelay: `${c.animDelay}s`,
              animationDuration: `${c.animDuration}s`,
            }}
          />
        ))}
        {STARS.map(s => (
          <div
            key={s.id}
            className="star-float"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              fontSize: `${s.size}px`,
              animationDelay: `${s.animDelay}s`,
              color: s.color,
            }}
          >
            ★
          </div>
        ))}
      </div>

      {/* Main collage card */}
      <div className="collage-card">
        {/* Header */}
        <div className="collage-header">
          <div className="balloons-row">
            {BALLOONS.map((b, i) => (
              <span
                key={i}
                className="balloon-emoji"
                style={{ animationDelay: `${i * 0.12}s` }}
              >{b}</span>
            ))}
          </div>

          <div className="title-block">
            <h1 className="collage-title">
              <span className="t-me">МНЕ</span>
              <span className="t-year"> 1 ГОД</span>
              <span className="t-excl">!</span>
            </h1>
            <div className="title-ribbon">✨ 12 месяцев счастья ✨</div>
          </div>

          {editingName ? (
            <div className="name-edit-row">
              <input
                className="name-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNameSave()}
                autoFocus
                maxLength={30}
                placeholder="Имя малыша"
              />
              <button className="name-save-btn" onClick={handleNameSave}>✓</button>
            </div>
          ) : (
            <button
              className="baby-name"
              onClick={() => { setEditingName(true); setNameInput(babyName); }}
              title="Нажмите, чтобы изменить имя"
            >
              <span className="name-star">⭐</span>
              <span>{babyName}</span>
              <span className="name-star">⭐</span>
              <span className="name-pen">✏️</span>
            </button>
          )}
        </div>

        {/* Photo grid 4x3 */}
        <div className="photo-grid">
          {photos.map((slot, idx) => (
            <div
              key={idx}
              className={`photo-cell ${slot.image ? "has-photo" : "empty"}`}
              onClick={() => handleSlotClick(idx)}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {slot.image ? (
                <>
                  <img src={slot.image} alt={`Месяц ${idx + 1}`} className="photo-img" />
                  <div className="photo-overlay">
                    <span className="change-hint">📷 Заменить</span>
                  </div>
                </>
              ) : (
                <div className="photo-placeholder">
                  <span className="ph-icon">📷</span>
                  <span className="ph-text">Добавить фото</span>
                </div>
              )}
              <div className="month-badge">
                <span className="month-num">{idx + 1}</span>
                <span className="month-name">{MONTHS[idx]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="collage-footer">
          <div className="footer-emojis">
            {["🎂", "✨", "🎈", "💛", "🌟", "🎊", "💕", "🎶", "🍰", "🌈"].map((e, i) => (
              <span
                key={i}
                className="footer-emoji"
                style={{ animationDelay: `${i * 0.18}s` }}
              >{e}</span>
            ))}
          </div>
          <p className="footer-hint">Нажми на ячейку, чтобы добавить фото</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
