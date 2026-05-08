import toast from 'react-hot-toast'

export const confirmAction = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                resolve(true)
              }}
              className="px-3 py-1 bg-ink text-on-primary text-[10px] font-bold uppercase rounded-[4px] hover:opacity-80 transition-opacity"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                resolve(false)
              }}
              className="px-3 py-1 border border-hairline text-[10px] font-bold uppercase rounded-[4px] hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      },
    )
  })
}

export const promptAction = (
  message: string,
  defaultValue: string = '',
): Promise<string | null> => {
  return new Promise((resolve) => {
    let value = defaultValue
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
          <input
            type="text"
            defaultValue={defaultValue}
            onChange={(e) => (value = e.target.value)}
            className="w-full bg-surface-soft border border-hairline px-2 py-1 text-[10px] font-bold outline-none focus:border-ink"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toast.dismiss(t.id)
                resolve(value)
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                resolve(value)
              }}
              className="px-3 py-1 bg-ink text-on-primary text-[10px] font-bold uppercase rounded-[4px] hover:opacity-80 transition-opacity"
            >
              OK
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                resolve(null)
              }}
              className="px-3 py-1 border border-hairline text-[10px] font-bold uppercase rounded-[4px] hover:bg-surface-soft transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      },
    )
  })
}
