import { useState, useRef, useCallback } from "react";

const LABELS = [
  "Родилась", "1 месяц", "2 месяца", "3 месяца",
  "4 месяца", "5 месяцев", "6 месяцев", "7 месяцев",
  "8 месяцев", "9 месяцев", "10 месяцев", "11 месяцев",
];

// 5-col × 7-row grid. Small ovals around the perimeter, center area for big photo + name
const POSITIONS: { col: number; row: number; idx: number }[] = [
  { col: 0, row: 0, idx: 0 },   // Родилась
  { col: 1, row: 0, idx: 1 },   // 1 месяц
  { col: 2, row: 0, idx: 2 },   // 2 месяца
  { col: 3, row: 0, idx: 3 },   // 3 месяца
  { col: 3, row: 2, idx: 4 },   // 4 месяца
  { col: 3, row: 3, idx: 5 },   // 5 месяцев
  { col: 3, row: 4, idx: 6 },   // 6 месяцев
  { col: 2, row: 6, idx: 7 },   // 7 месяцев
  { col: 1, row: 6, idx: 8 },   // 8 месяцев
  { col: 0, row: 4, idx: 9 },   // 9 месяцев
  { col: 0, row: 3, idx: 10 },  // 10 месяцев
  { col: 0, row: 2, idx: 11 },  // 11 месяцев
];

export default function Index() {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(13).fill(null));
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
      setPhotos(prev => prev.map((p, i) => i === activeSlot ? ev.target?.result as string : p));
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

  const startEditField = (field: "date" | "weight" | "time", val: string) => {
    setEditingField(field);
    setFieldInput(val);
  };

  return (
    <div className="poster-root">
      {/* Scattered hearts */}
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

      {/* Corner flower decorations */}
      <div className="flower-corner tl" aria-hidden="true" />
      <div className="flower-corner tr" aria-hidden="true" />
      <div className="flower-corner bl" aria-hidden="true" />
      <div className="flower-corner br" aria-hidden="true" />

      <div className="poster-inner">
        <div className="photo-layout">

          {/* 12 small oval slots around perimeter */}
          {POSITIONS.map(({ col, row, idx }) => (
            <div
              key={idx}
              className="oval-slot"
              style={{ gridColumn: col + 1, gridRow: row + 1 }}
              onClick={() => openPhoto(idx)}
            >
              <div className="oval-frame">
                {photos[idx]
                  ? <img src={photos[idx]!} alt={LABELS[idx]} className="oval-img" />
                  : <div className="oval-empty"><span className="oval-cam">📷</span></div>
                }
              </div>
              <div className="oval-label">{LABELS[idx]}</div>
            </div>
          ))}

          {/* Central large oval photo — rows 1–5, cols 2–3 */}
          <div
            className="center-slot"
            style={{ gridColumn: "2 / 4", gridRow: "1 / 6" }}
            onClick={() => openPhoto(12)}
          >
            <div className="center-frame">
              {photos[12]
                ? <img src={photos[12]!} alt="Главное фото" className="center-img" />
                : (
                  <div className="center-empty">
                    <span className="center-cam">📷</span>
                    <span className="center-hint">Главное фото</span>
                  </div>
                )
              }
            </div>
          </div>

          {/* Name + subtitle block — rows 5–7, cols 2–3 */}
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
              <h1
                className="name-title"
                onClick={() => { setEditingName(true); setNameInput(babyName); }}
                title="Нажмите, чтобы изменить имя"
              >{babyName}</h1>
            )}
            <p className="name-sub">Первый годик</p>
            <div className="name-heart">♥</div>
          </div>

        </div>

        {/* Bottom info strip */}
        <div className="info-bar">
          <div className="info-item" onClick={() => startEditField("date", birthDate)}>
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
          <div className="info-item" onClick={() => startEditField("weight", weight)}>
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
          <div className="info-item" onClick={() => startEditField("time", birthTime)}>
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
