"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  FolderOpen,
  HeartHandshake,
  Landmark,
  Quote,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useGetPublicLawyers } from "@/hooks/lawyer.hook";
import { getApiErrorMessage } from "@/lib/apiClient";

const legalDepartments = [
  {
    icon: Landmark,
    name: "Family & Personal Law",
    description:
      "Guidance for family relationships, personal rights, and related legal matters.",
  },
  {
    icon: BriefcaseBusiness,
    name: "Business & Corporate",
    description:
      "Support for business agreements, company matters, and commercial decisions.",
  },
  {
    icon: Building2,
    name: "Property & Real Estate",
    description:
      "Help navigating property transactions, ownership questions, and real estate disputes.",
  },
  {
    icon: FileText,
    name: "Civil Disputes",
    description:
      "Advice and representation for disagreements involving rights, obligations, or compensation.",
  },
  {
    icon: ShieldCheck,
    name: "Criminal Defense",
    description:
      "Legal representation and guidance for people facing criminal allegations.",
  },
  {
    icon: HeartHandshake,
    name: "Employment & Labor",
    description:
      "Help with workplace rights, employment agreements, and labor-related concerns.",
  },
];

const reasonsToChooseUs = [
  {
    icon: BadgeCheck,
    title: "Profiles reviewed before listing",
    description:
      "Lawyer applications go through an administrator review before profiles are made public, helping you make a more informed first choice.",
  },
  {
    icon: CalendarDays,
    title: "Appointments with clear availability",
    description:
      "See published consultation times and available spaces, then follow the booking and payment steps in one place.",
  },
  {
    icon: FolderOpen,
    title: "Case details stay organized",
    description:
      "Keep case documents, messages, and timeline activity together in a workspace shared with your assigned lawyer.",
  },
];

const clientPerspectives = [
  {
    title: "Finding a starting point",
    quote:
      "I can review lawyer profiles and available consultation times before deciding who to contact.",
  },
  {
    title: "Keeping case work together",
    quote:
      "Having messages, documents, and case updates in one workspace makes it easier to follow what is happening.",
  },
  {
    title: "Knowing what comes next",
    quote:
      "I can check my appointment details and return to the same place for case information.",
  },
];

const illustrativeCaseStudies = [
  {
    icon: HeartHandshake,
    area: "Family matters",
    title: "Preparing for an initial consultation",
    description:
      "A client reviews lawyer profiles, compares available consultation times, and books a conversation to discuss their situation.",
  },
  {
    icon: Building2,
    area: "Small business",
    title: "Bringing contract questions into focus",
    description:
      "A business owner meets with counsel and uses the case workspace to keep related messages, documents, and timeline updates together.",
  },
  {
    icon: Landmark,
    area: "Property matters",
    title: "Keeping property case documents organized",
    description:
      "A client and their assigned lawyer use the shared case workspace to refer to case documents and follow ongoing activity.",
  },
];

export default function Homepage() {
  const [search, setSearch] = useState("");
  const lawyers = useGetPublicLawyers({
    page: 1,
    limit: 6,
    ...(search ? { searchTerm: search } : {}),
  });
  const lawyerList = lawyers.data?.data ?? [];

  return (
    <div className="bg-[#fbfcfb] text-[#1b2821]">
      <section className="relative isolate min-h-142.5 overflow-hidden bg-[#123d32] text-white lg:min-h-155">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(10,42,33,.94) 0%, rgba(10,42,33,.81) 48%, rgba(10,42,33,.22) 100%), url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2200&q=85')",
          }}
        />
        <div className="mx-auto flex min-h-142.5 max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-155">
          <div className="max-w-2xl animate-[rise-in_.6s_ease-out_both]">
            <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b8d5c5]">
              <span className="h-px w-7 bg-[#b8d5c5]" /> Legal counsel, within
              reach
            </p>
            <h1 className="max-w-162.5 font-serif text-[42px] leading-[1.06] tracking-normal sm:text-[58px] lg:text-[68px]">
              Justice Desk
            </h1>
            <p className="mt-5 max-w-130 text-[15px] leading-7 text-white/75 sm:text-base">
              Find verified legal counsel, book a consultation, and keep your
              case work organized from one secure workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#counsel"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[#e4bd7d] px-5 text-sm font-semibold text-[#26372e] hover:bg-[#f0ce91]"
              >
                Find a lawyer <ArrowRight size={16} />
              </Link>
              <Link
                href="/apply"
                className="inline-flex h-11 items-center rounded-md border border-white/30 bg-white/5 px-5 text-sm text-white hover:bg-white/10"
              >
                Join as Lawyer
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/65">
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#b8d5c5]" /> Verified
                lawyer profiles
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#b8d5c5]" />{" "}
                Capacity-based appointments
              </span>
              <span className="flex items-center gap-2">
                <BriefcaseBusiness size={15} className="text-[#b8d5c5]" /> Case
                collaboration
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
      </section>

      <section
        id="counsel"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="flex flex-col justify-between gap-5 border-b border-[#e2e9e4] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#61806e]">
              Browse counsel
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#1b3026]">
              Lawyers on Justice Desk
            </h2>
            <p className="mt-2 text-sm text-[#77837c]">
              Profiles and practice areas returned by the Justice Desk service.
            </p>
          </div>
          <label className="relative block w-full sm:max-w-75">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#819087]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search lawyers"
              className="h-10 w-full rounded-md border border-[#dce5de] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15"
            />
          </label>
        </div>

        {lawyers.isPending ? (
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-xl border border-[#e3e9e5] bg-[#f4f7f5]"
              />
            ))}
          </div>
        ) : null}
        {lawyers.isError ? (
          <div
            role="alert"
            className="my-8 rounded-xl border-l-2 border-[#c2725f] bg-[#fbf6f3] px-4 py-3 text-sm text-[#744d41]"
          >
            {getApiErrorMessage(lawyers.error)}
          </div>
        ) : null}
        {!lawyers.isPending && !lawyers.isError && lawyerList.length === 0 ? (
          <div className="my-9 rounded-xl border border-dashed border-[#d5dfd8] px-5 py-12 text-center">
            <UserRound size={23} className="mx-auto text-[#799083]" />
            <p className="mt-3 text-sm font-medium text-[#45574c]">
              No lawyers found
            </p>
            <p className="mt-1 text-xs text-[#87938c]">
              Try another search or check back later.
            </p>
          </div>
        ) : null}
        {lawyerList.length > 0 ? (
          <div className="grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3">
            {lawyerList.map((lawyer) => (
              <article
                key={lawyer.id}
                className="flex min-h-50 flex-col rounded-xl border border-[#dfe7e1] bg-white p-5 transition-colors hover:border-[#9eb9a8]"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8f0ea] text-sm font-semibold text-[#315b43]">
                    {lawyer.name?.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[#20352a]">
                      {lawyer.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#78857d]">
                      {lawyer.qualifications || "Legal counsel"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-[#67766c]">
                  {lawyer.bio ||
                    "View this lawyer's profile and available consultation schedule."}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-[#edf1ee] pt-3">
                  <span className="text-xs font-medium text-[#355c47]">
                    {lawyer.consultationFee
                      ? `BDT ${lawyer.consultationFee}`
                      : "Fee not listed"}
                  </span>
                  <Link
                    href={`/login?next=${encodeURIComponent("/client/lawyers")}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#39715d] hover:underline"
                  >
                    View and book <ArrowUpRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {lawyers.data?.meta && lawyers.data.meta.total > lawyerList.length ? (
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md border border-[#cfdbd2] px-4 text-xs font-medium text-[#315744] hover:bg-[#f3f7f4]"
            >
              Sign in to browse all lawyers
            </Link>
          </div>
        ) : null}
      </section>

      <section id="why-us" className="border-y border-[#e1e8e3] bg-[#f1f5f2]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#61806e]">
              A more considered way to find counsel
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#1b3026] sm:text-4xl">
              Why choose Justice Desk?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#77837c]">
              Practical tools help you move from finding a lawyer to keeping
              your appointment and case work in order.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reasonsToChooseUs.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-[#dfe7e1] bg-white p-5"
              >
                <span className="grid size-10 place-items-center rounded-md bg-[#e8f0ea] text-[#39715d]">
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#2d4838]">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#77837c]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="client-stories"
        className="relative isolate overflow-hidden bg-[#123d32] text-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(184,213,197,0.18),transparent_55%)]"
        />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#b8d5c5]">
                The client experience
              </p>
              <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
                What our customers say
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Clear information, convenient appointments, and a more organized
                place to work with counsel.
              </p>
            </div>
            <p className="max-w-xs text-[11px] leading-5 text-white/55">
              Illustrative client perspectives, not verbatim reviews or
              endorsements from actual customers.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {clientPerspectives.map(({ title, quote }) => (
              <article
                key={title}
                className="rounded-xl border border-white/15 bg-white/[0.06] p-5"
              >
                <Quote size={20} className="text-[#e4bd7d]" />
                <p className="mt-4 text-sm leading-6 text-white/90">
                  “{quote}”
                </p>
                <h3 className="mt-5 border-t border-white/15 pt-3 text-xs font-semibold text-[#b8d5c5]">
                  {title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="bg-[#f8f5ee]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b7551]">
                A look at the workflow
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#1b3026] sm:text-4xl">
                Case studies
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#77837c]">
                See how appointments and case tools can support different kinds
                of legal matters.
              </p>
            </div>
            <p className="max-w-xs text-[11px] leading-5 text-[#7b766b]">
              Illustrative scenarios only. They do not describe actual clients,
              legal advice, or case outcomes.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {illustrativeCaseStudies.map(
              ({ icon: Icon, area, title, description }) => (
                <article
                  key={area}
                  className="flex flex-col rounded-xl border border-[#e7e0d1] bg-[#fffefa] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-[#f2ead9] text-[#80653b]">
                      <Icon size={19} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7551]">
                      {area}
                    </span>
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-[#2d4838]">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#77837c]">
                    {description}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="legal-departments"
        className="border-t border-[#dce6df] bg-[#eaf1ec]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-5 border-b border-[#d6e1d9] pb-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#61806e]">
                Find the right area of law
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#1b3026] sm:text-4xl">
                Legal departments
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#77837c]">
                Explore common areas of law and find lawyers whose experience
                may align with your needs.
              </p>
            </div>
            <Link
              href="#counsel"
              className="inline-flex h-9 shrink-0 items-center gap-2 text-xs font-semibold text-[#39715d] hover:underline"
            >
              Browse lawyers <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {legalDepartments.map(({ icon: Icon, name, description }) => (
              <article
                key={name}
                className="rounded-xl border border-[#dfe7e1] bg-white p-4 transition-colors hover:border-[#9eb9a8]"
              >
                <span className="grid size-9 place-items-center rounded-md bg-[#e8f0ea] text-[#39715d]">
                  <Icon size={17} />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[#2d4838]">
                  {name}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#77837c]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
