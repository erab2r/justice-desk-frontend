import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="bg-[#fbfcfb] text-[#1b2821]">
      <section className="border-b border-[#e1e8e3] bg-[#eef3ef]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#61806e]">
            About Justice Desk
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#1b3026] sm:text-5xl">
            Legal consultations and case work, in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#647168]">
            Justice Desk connects clients with approved lawyers and gives both
            sides a shared workspace for appointments, documents, and case
            communication.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-7 md:grid-cols-2">
          <div className="border-l-2 border-[#8ea995] pl-5">
            <ShieldCheck size={19} className="text-[#39715d]" />
            <h2 className="mt-3 text-sm font-semibold text-[#2d4838]">
              Reviewed professional profiles
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#77837c]">
              Lawyer applications include professional details and supporting
              files, then enter an administrator review process before public
              listing.
            </p>
          </div>
          <div className="border-l-2 border-[#8ea995] pl-5">
            <CalendarDays size={19} className="text-[#39715d]" />
            <h2 className="mt-3 text-sm font-semibold text-[#2d4838]">
              Capacity-based consultations
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#77837c]">
              Lawyers publish a date-and-time window with a booking capacity.
              Clients can view available schedules and begin payment through a
              supported gateway.
            </p>
          </div>
          <div className="border-l-2 border-[#8ea995] pl-5">
            <BriefcaseBusiness size={19} className="text-[#39715d]" />
            <h2 className="mt-3 text-sm font-semibold text-[#2d4838]">
              Case collaboration
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#77837c]">
              Case work brings messages, timeline entries, document records,
              reports, invoices, and lawyer notes together under role-based
              access.
            </p>
          </div>
          <div className="border-l-2 border-[#8ea995] pl-5">
            <FileText size={19} className="text-[#39715d]" />
            <h2 className="mt-3 text-sm font-semibold text-[#2d4838]">
              Role-aware workspaces
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#77837c]">
              Clients, lawyers, and administrators see workflows permitted by
              their account role and the Justice Desk service.
            </p>
          </div>
        </div>
        <Link
          href="/register"
          className="mt-10 inline-flex items-center gap-2 rounded-md bg-[#174638] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#10372c]"
        >
          Create a client account <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
