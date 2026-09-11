import type { ReactNode } from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{children}</p>
    </article>
  );
}
