import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  /** 外枠（幅など）のクラス */
  className?: string;
  /** 入力欄そのものに足すクラス（文字サイズなど） */
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className' | 'list'>;

/**
 * 自由入力できる候補付きの入力欄。
 * 開いた直後は入力済みの文字に関係なく全候補を表示し、文字を打ったときだけ絞り込む
 * （datalist は入力済みの文字で絞り込むため、選び直すには文字を消す必要があった）。
 */
export default function ComboInput({ value, onChange, options, className = '', inputClassName = '', ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // 一覧は body 直下に出す（半透明の死亡者カードや後続カードに埋もれないように）
  const [rect, setRect] = useState<DOMRect>();
  useEffect(() => {
    if (!open) return;
    const place = () => setRect(inputRef.current?.getBoundingClientRect());
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const shown = filtering && value ? options.filter((o) => o.includes(value)) : options;

  const show = () => {
    setOpen(true);
    setFiltering(false);
    setActive(options.indexOf(value));
  };
  const pick = (o: string) => {
    onChange(o);
    setOpen(false);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <input
        {...rest}
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        className={`input w-full min-w-0 pr-5 ${inputClassName}`}
        value={value}
        onFocus={(e) => {
          show();
          rest.onFocus?.(e);
        }}
        onClick={() => !open && show()}
        onBlur={(e) => {
          setOpen(false);
          rest.onBlur?.(e);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setFiltering(true);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) return show();
            const d = e.key === 'ArrowDown' ? 1 : -1;
            setActive((a) => (shown.length ? (a + d + shown.length) % shown.length : -1));
          } else if (e.key === 'Enter' && open && shown[active] !== undefined) {
            e.preventDefault();
            pick(shown[active]);
          } else if (e.key === 'Escape' && open) {
            // 一覧だけ閉じ、入力欄からは抜けない（ショートカット側の Esc に渡さない）
            e.stopPropagation();
            setOpen(false);
          }
          rest.onKeyDown?.(e);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="候補を表示"
        className="absolute inset-y-0 right-0 px-1 text-[10px] text-slate-400"
        onMouseDown={(e) => {
          e.preventDefault();
          if (open) setOpen(false);
          else if (document.activeElement === inputRef.current) show();
          else inputRef.current?.focus(); // onFocus で一覧が開く
        }}
      >
        ▼
      </button>
      {open &&
        rect &&
        shown.length > 0 &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            style={{ top: rect.bottom + 2, left: rect.left, minWidth: rect.width }}
            className="fixed z-50 max-h-60 overflow-y-auto rounded border border-slate-300 bg-white py-0.5 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {shown.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                // blur より先に選択させる
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setActive(i)}
                className={[
                  'cursor-pointer px-2 py-0.5 whitespace-nowrap',
                  i === active ? 'bg-indigo-100 dark:bg-indigo-900' : '',
                  o === value ? 'font-semibold' : '',
                ].join(' ')}
              >
                {o}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
