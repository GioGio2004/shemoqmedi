import { ButtonLink } from "./ui";

export function SubmitCta() {
  return (
    <section aria-labelledby="cta-title" className="container-site pb-24">
      <div className="flex flex-col gap-8 rounded-md bg-beige px-6 py-16 md:px-12 md:py-24">
        <h2
          id="cta-title"
          className="max-w-4xl text-[clamp(2.25rem,5.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
        >
          Your work deserves a jury.
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
          Create a free account, submit your website and get honest scores from
          people who build the web.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/sign-up" className="bg-paper hover:bg-beige-deep">
            Submit your work
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="outline" className="bg-transparent">
            I have an account
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
