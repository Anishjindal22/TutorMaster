export default function Tab({ tabData, field, setField }) {
    return (
      <div
        className="flex bg-surface-dim border border-surface-border p-1.5 gap-x-1 my-4 rounded-full max-w-max shadow-sm"
      >
        {tabData.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setField(tab.type)}
            className={`${
              field === tab.type
                ? "bg-brand-primary text-white shadow-glow"
                : "bg-transparent text-text-muted hover:text-white"
            } py-2.5 px-6 font-medium rounded-full transition-all duration-300`}
          >
            {tab?.tabName}
          </button>
        ))}
      </div>
    );
  }