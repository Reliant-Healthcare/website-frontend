export default function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <section className="bg-gray-50 py-20 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-xl leading-8 text-foreground/70">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
