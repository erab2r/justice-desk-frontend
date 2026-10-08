import type { ReactNode } from "react";

export function AuthFrame({
  eyebrow,
  title,
  description,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-12">
      <section className="relative flex min-h-64 flex-col justify-center overflow-hidden rounded-2xl border border-[#dce7e0] bg-gradient-to-br from-[#f0f5f1] via-[#eaf1ec] to-[#e2ece5] p-6 sm:min-h-80 sm:p-9 md:min-h-[34rem] md:p-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-[#d1e0d6] sm:size-80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full border border-[#d1e0d6] sm:size-64"
        />
        <div className="relative">
          <p className="inline-flex rounded-full border border-[#d5e2d9] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#527563] sm:text-xs">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-lg font-serif text-3xl leading-tight text-[#1b3026] sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#65766c] sm:text-base sm:leading-7">
            {description}
          </p>
          {footer && (
            <div className="mt-7 text-sm text-[#65766c]">{footer}</div>
          )}
        </div>
      </section>
      <section className="w-full max-w-2xl justify-self-center rounded-2xl border border-[#e1e8e3] bg-white p-5 shadow-[0_18px_55px_-35px_rgba(25,54,39,0.28)] sm:p-8 lg:p-9 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight sm:[&_h1]:text-2xl">
        {children}
      </section>
    </main>
  );
}
