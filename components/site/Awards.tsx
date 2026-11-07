import { CRITERIA, CRITERIA_WEIGHTS, type Criterion } from "@/lib/showcase";
import { SectionHeader } from "./ui";

const STEPS = [
  {
    title: "Submit",
    text: "Send your live website with screenshots, credits and the tools you used.",
  },
  {
    title: "Jury scores",
    text: "Jury members score each criterion from 1 to 10 within seven days.",
  },
  {
    title: "Creation of the day",
    text: "The highest-scoring site of the day is featured on the front page.",
  },
  {
    title: "Month and year",
    text: "Daily winners go on to the monthly and annual awards.",
  },
];

export function Awards() {
  const criteria = Object.keys(CRITERIA_WEIGHTS) as Criterion[];

  return (
    <section aria-labelledby="awards" className="scroll-mt-20 bg-beige py-24">
      <div className="container-site">
        <SectionHeader id="awards" label="Awards" title="How a site gets awarded" />

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <p className="max-w-md text-lg leading-relaxed text-ink-soft lg:col-span-4">
            Every submission is scored by an independent jury on four weighted
            criteria. Speed counts: craft is almost a third of the score.
          </p>

          <dl className="lg:col-span-8">
            {criteria.map((key) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-line py-5 md:grid-cols-[12rem_1fr_auto]"
              >
                <dt className="text-xl font-semibold tracking-[-0.02em]">{CRITERIA[key].name}</dt>
                <dd className="col-span-2 row-start-2 text-ink-soft md:col-span-1 md:col-start-2 md:row-start-1">
                  {CRITERIA[key].description}
                </dd>
                <dd className="col-start-2 row-start-1 text-right text-xl font-medium tabular-nums md:col-start-3">
                  {CRITERIA_WEIGHTS[key]}%
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 bg-beige p-6">
              <span className="font-mono text-xs text-ink-soft">0{i + 1}</span>
              <h3 className="text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
