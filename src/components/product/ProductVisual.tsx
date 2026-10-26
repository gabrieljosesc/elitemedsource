export default function ProductVisual({ categoryLabel }: { categoryLabel: string }) {
  return (
    <div className="bg-card border border-line-strong rounded-xl aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-brand-tint to-transparent">
      <span className="absolute top-4 left-4 eyebrow">{categoryLabel}</span>
      <div className="w-[92px] h-[260px] relative">
        <span className="absolute left-7 right-7 top-0 h-9 bg-brand rounded-[5px]" />
        <span className="absolute left-9 right-9 top-9 h-8 bg-brand/20 border-x border-t border-brand" />
        <span className="absolute left-3.5 right-3.5 top-[60px] bottom-0 bg-brand/[0.22] border-[1.5px] border-brand rounded-t-[10px] rounded-b-[14px]" />
        <span className="absolute left-5 right-5 bottom-[6px] h-28 bg-brand/85 rounded-[5px]" />
        <span className="absolute left-5 right-5 top-[92px] h-px bg-brand/40" />
        <span className="absolute left-5 right-5 top-[112px] h-px bg-brand/40" />
      </div>
    </div>
  );
}
