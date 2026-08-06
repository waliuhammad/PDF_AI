/** A chat is fetched per id, so this fills the gap before the thread arrives. */
export default function Loading() {
    return (
        <div className="w-full animate-pulse space-y-4">
            <div className="h-7 w-64 max-w-full rounded-xl bg-[var(--background-secondary)] mb-6" />

            {[72, 96, 60, 88].map((h, i) => (
                <div
                    key={i}
                    className={`rounded-2xl bg-[var(--background-secondary)] ${i % 2 ? "ml-auto w-3/5" : "w-4/5"
                        }`}
                    style={{ height: h }}
                />
            ))}
        </div>
    );
}
