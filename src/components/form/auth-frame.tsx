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
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 px-5 py-10 md:grid-cols-2">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#61806e]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[#1b3026]">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#77837c]">
          {description}
        </p>
        {footer && (
          <div className="mt-6 text-sm text-[#77837c]">{footer}</div>
        )}
      </section>
      <section className="w-full max-w-lg justify-self-center">{children}</section>
    </main>
  );
}
