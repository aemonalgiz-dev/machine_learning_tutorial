export function LessonSearchForm() {
  return (
    <form action="/search" role="search" className="max-w-2xl">
      <label htmlFor="lesson-search" className="mb-2 block text-sm font-semibold">Looking for something specific?</label>
      <div className="flex gap-2">
        <input id="lesson-search" name="q" type="search" placeholder="Try attention, matrices, or Python" className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 text-base" />
        <button type="submit" className="shrink-0 rounded-lg border border-line bg-surface px-4 text-sm font-semibold hover:bg-raised">Search</button>
      </div>
    </form>
  );
}
