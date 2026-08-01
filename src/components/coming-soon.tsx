import { ButtonLink, Container, Eyebrow } from "./ui";

/**
 * Temporary placeholder for routes that are scaffolded but not built yet.
 * Delete this component once every page has a real implementation.
 */
export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="py-28 sm:py-36">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-7 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-display">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            {description}
          </p>
          <ButtonLink href="/" variant="secondary" className="mt-10">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
